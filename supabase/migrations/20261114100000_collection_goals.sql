-- Daily goals per collection. A row exists only for a collection the member
-- set a goal on; no row means no goal. Counts stay derived from review_state
-- stamps (no counters), joined to terms for the collection. See docs/goals.md.
-- Rollback: this drops user_settings.daily_goals and goal_celebrated, so a
-- rollback needs a restore from backup.

create table public.collection_goals (
  user_id uuid not null references public.users (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  read_goal integer,
  review_goal integer,
  quiz_goal integer,
  celebrated_on date,
  celebrated_tiers text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, collection_id)
);

comment on table public.collection_goals is
  'Daily goals of one member for one collection. A tier set to null has no goal; a collection without a row has no goals. celebrated_tiers are the tiers already celebrated on celebrated_on (the member''s local date).';

alter table public.collection_goals enable row level security;

create policy "Users read their collection goals" on public.collection_goals
  for select to authenticated using (user_id = auth.uid());

grant select on public.collection_goals to authenticated;

alter table public.user_settings
  add column new_collection_goals jsonb;

comment on column public.user_settings.new_collection_goals is
  'Goals a collection starts with when the member adds or creates it, as {"read": n|null, "review": n|null, "quiz": n|null}. Set only by "all collections" on the Goals page; null means new collections start without goals.';

-- A goal is a whole number from 1 to 200; anything else is off.
create function public.goal_value(p_value jsonb)
returns integer
language sql
immutable
as $$
  select case
    when jsonb_typeof(p_value) = 'number' and p_value::text ~ '^[0-9]{1,3}$'
      and (p_value::text)::integer between 1 and 200
    then (p_value::text)::integer
  end;
$$;

-- Sets the given tiers on one row and leaves the others as they are. Raising a
-- tier, or turning it back on, reopens today's celebration for it. A row with
-- no goals left is deleted.
create function public.set_collection_goal_tiers(
  p_user_id uuid,
  p_collection_id uuid,
  p_goals jsonb,
  p_tiers text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.collection_goals%rowtype;
  v_read integer;
  v_review integer;
  v_quiz integer;
  v_new integer;
  v_raised text[] := '{}';
begin
  select * into v_row
  from public.collection_goals
  where user_id = p_user_id and collection_id = p_collection_id
  for update;

  v_read := v_row.read_goal;
  v_review := v_row.review_goal;
  v_quiz := v_row.quiz_goal;

  if 'read' = any (p_tiers) then
    v_new := public.goal_value(p_goals -> 'read');
    if v_new is not null and (v_read is null or v_new > v_read) then
      v_raised := array_append(v_raised, 'read');
    end if;
    v_read := v_new;
  end if;
  if 'review' = any (p_tiers) then
    v_new := public.goal_value(p_goals -> 'review');
    if v_new is not null and (v_review is null or v_new > v_review) then
      v_raised := array_append(v_raised, 'review');
    end if;
    v_review := v_new;
  end if;
  if 'quiz' = any (p_tiers) then
    v_new := public.goal_value(p_goals -> 'quiz');
    if v_new is not null and (v_quiz is null or v_new > v_quiz) then
      v_raised := array_append(v_raised, 'quiz');
    end if;
    v_quiz := v_new;
  end if;

  if v_read is null and v_review is null and v_quiz is null then
    delete from public.collection_goals
    where user_id = p_user_id and collection_id = p_collection_id;
    return;
  end if;

  insert into public.collection_goals as g (
    user_id, collection_id, read_goal, review_goal, quiz_goal,
    celebrated_on, celebrated_tiers, updated_at
  )
  values (
    p_user_id, p_collection_id, v_read, v_review, v_quiz,
    v_row.celebrated_on,
    array(select t from unnest(coalesce(v_row.celebrated_tiers, '{}')) t where t <> all (v_raised)),
    now()
  )
  on conflict (user_id, collection_id) do update
  set read_goal = excluded.read_goal,
      review_goal = excluded.review_goal,
      quiz_goal = excluded.quiz_goal,
      celebrated_tiers = excluded.celebrated_tiers,
      updated_at = now();
end;
$$;

revoke all on function public.set_collection_goal_tiers(uuid, uuid, jsonb, text[]) from public;

-- Distinct terms of one collection (every collection when none is given), by
-- tier, on the member's local day. A term
-- counts for a tier when that tier's stamp falls on today. Only rows touched
-- in the last two days are joined to terms, so the cost follows today's
-- activity and not the size of the library.
create function public.goal_day_counts(p_user_id uuid, p_collection_id uuid default null)
returns table (
  today date,
  read_count integer,
  reviewed_count integer,
  quizzed_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  with day as (
    select
      tz.v_tz,
      (now() at time zone tz.v_tz)::date as today
    from (
      select coalesce(
        (select timezone from public.user_settings where user_id = p_user_id),
        'Europe/Amsterdam'
      ) as v_tz
    ) tz
  ),
  recent as materialized (
    select rs.term_id, rs.last_read_at, rs.last_review_recall_at, rs.last_quiz_tested_at
    from public.review_state rs
    where rs.user_id = p_user_id
      and greatest(rs.last_read_at, rs.last_review_recall_at, rs.last_quiz_tested_at)
        >= now() - interval '2 days'
  )
  select
    day.today,
    (count(r.term_id) filter (
      where (r.last_read_at at time zone day.v_tz)::date = day.today
    ))::integer,
    (count(r.term_id) filter (
      where (r.last_review_recall_at at time zone day.v_tz)::date = day.today
    ))::integer,
    (count(r.term_id) filter (
      where (r.last_quiz_tested_at at time zone day.v_tz)::date = day.today
    ))::integer
  from day
  left join (
    select recent.*
    from recent
    join public.terms t
      on t.id = recent.term_id
      and (p_collection_id is null or t.collection_id = p_collection_id)
  ) r on true
  group by day.today;
$$;

revoke all on function public.goal_day_counts(uuid, uuid) from public;
grant execute on function public.goal_day_counts(uuid, uuid) to service_role;

drop function public.goal_day_counts(uuid);
drop function public.my_get_goal_day();
drop function public.my_claim_goal_celebration(text, boolean);

create function public.my_get_goal_day(p_collection_id uuid default null)
returns table (
  today date,
  read_count integer,
  reviewed_count integer,
  quizzed_count integer,
  read_goal integer,
  review_goal integer,
  quiz_goal integer,
  celebrated text[]
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    c.today,
    c.read_count,
    c.reviewed_count,
    c.quizzed_count,
    g.read_goal,
    g.review_goal,
    g.quiz_goal,
    case when g.celebrated_on = c.today then g.celebrated_tiers else '{}'::text[] end
  from public.goal_day_counts(auth.uid(), p_collection_id) c
  left join public.collection_goals g
    on g.user_id = auth.uid() and g.collection_id = p_collection_id;
end;
$$;

revoke all on function public.my_get_goal_day(uuid) from public;
grant execute on function public.my_get_goal_day(uuid) to authenticated;

-- Records a tier of one collection as celebrated today and returns true, but
-- only when its goal is met (or the tier ran out of terms), it wasn't
-- celebrated yet today, and celebrations are on. The count is the server's,
-- for terms of that collection only. The row lock makes two tabs or devices
-- race safely.
create function public.my_claim_goal_celebration(
  p_collection_id uuid,
  p_tier text,
  p_caught_up boolean
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_celebrate boolean;
  v_row public.collection_goals%rowtype;
  v_counts record;
  v_goal integer;
  v_done integer;
  v_tiers text[];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_tier not in ('read', 'review', 'quiz') then
    raise exception 'Unknown goal tier %', p_tier;
  end if;

  select goal_celebrate into v_celebrate
  from public.user_settings where user_id = auth.uid();
  if not coalesce(v_celebrate, true) then
    return false;
  end if;

  select * into v_row
  from public.collection_goals
  where user_id = auth.uid() and collection_id = p_collection_id
  for update;
  if not found then
    return false;
  end if;

  v_goal := case p_tier
    when 'read' then v_row.read_goal
    when 'review' then v_row.review_goal
    else v_row.quiz_goal
  end;
  if v_goal is null then
    return false;
  end if;

  select * into v_counts from public.goal_day_counts(auth.uid(), p_collection_id);

  v_tiers := case when v_row.celebrated_on = v_counts.today then v_row.celebrated_tiers else '{}' end;
  if p_tier = any (v_tiers) then
    return false;
  end if;

  v_done := case p_tier
    when 'read' then v_counts.read_count
    when 'review' then v_counts.reviewed_count
    else v_counts.quizzed_count
  end;
  if v_done < v_goal and not p_caught_up then
    return false;
  end if;

  update public.collection_goals
  set celebrated_on = v_counts.today,
      celebrated_tiers = v_tiers || p_tier,
      updated_at = now()
  where user_id = auth.uid() and collection_id = p_collection_id;

  return true;
end;
$$;

revoke all on function public.my_claim_goal_celebration(uuid, text, boolean) from public;
grant execute on function public.my_claim_goal_celebration(uuid, text, boolean) to authenticated;

-- Saves a collection's goals. With p_apply_all, p_tiers (all three when empty)
-- are copied to every collection in the member's library and become what new
-- collections start with. The rest of the goals on other collections stay.
create function public.my_save_collection_goals(
  p_collection_id uuid,
  p_goals jsonb,
  p_apply_all boolean,
  p_tiers text[]
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_all constant text[] := array['read', 'review', 'quiz'];
  v_tiers text[];
  v_id uuid;
  v_default jsonb;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_in_user_collections(p_collection_id) then
    raise exception 'Collection is not in your library';
  end if;

  perform public.set_collection_goal_tiers(v_user, p_collection_id, p_goals, v_all);
  if not p_apply_all then
    return;
  end if;

  v_tiers := case when coalesce(cardinality(p_tiers), 0) = 0 then v_all else p_tiers end;
  if exists (select 1 from unnest(v_tiers) t where t <> all (v_all)) then
    raise exception 'Unknown goal tier';
  end if;

  for v_id in
    select c.id from public.collections c where c.owner_id = v_user
    union
    select uc.collection_id from public.user_collections uc where uc.user_id = v_user
  loop
    if v_id <> p_collection_id then
      perform public.set_collection_goal_tiers(v_user, v_id, p_goals, v_tiers);
    end if;
  end loop;

  select coalesce(new_collection_goals, '{}'::jsonb) into v_default
  from public.user_settings where user_id = v_user;
  v_default := jsonb_build_object(
    'read', case when 'read' = any (v_tiers)
      then coalesce(to_jsonb(public.goal_value(p_goals -> 'read')), 'null'::jsonb)
      else coalesce(v_default -> 'read', 'null'::jsonb) end,
    'review', case when 'review' = any (v_tiers)
      then coalesce(to_jsonb(public.goal_value(p_goals -> 'review')), 'null'::jsonb)
      else coalesce(v_default -> 'review', 'null'::jsonb) end,
    'quiz', case when 'quiz' = any (v_tiers)
      then coalesce(to_jsonb(public.goal_value(p_goals -> 'quiz')), 'null'::jsonb)
      else coalesce(v_default -> 'quiz', 'null'::jsonb) end
  );
  if v_default -> 'read' = 'null'::jsonb
    and v_default -> 'review' = 'null'::jsonb
    and v_default -> 'quiz' = 'null'::jsonb then
    v_default := null;
  end if;

  insert into public.user_settings (user_id, new_collection_goals)
  values (v_user, v_default)
  on conflict (user_id) do update
  set new_collection_goals = excluded.new_collection_goals, updated_at = now();
end;
$$;

revoke all on function public.my_save_collection_goals(uuid, jsonb, boolean, text[]) from public;
grant execute on function public.my_save_collection_goals(uuid, jsonb, boolean, text[]) to authenticated;

-- A collection the member adds or creates starts with their saved default.
create function public.apply_new_collection_goals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_collection uuid;
  v_default jsonb;
begin
  if tg_table_name = 'collections' then
    v_user := new.owner_id;
    v_collection := new.id;
  else
    v_user := new.user_id;
    v_collection := new.collection_id;
  end if;
  if v_user is null then
    return new;
  end if;

  select new_collection_goals into v_default
  from public.user_settings where user_id = v_user;
  if v_default is not null then
    perform public.set_collection_goal_tiers(
      v_user, v_collection, v_default, array['read', 'review', 'quiz']
    );
  end if;
  return new;
end;
$$;

revoke all on function public.apply_new_collection_goals() from public;

create trigger collections_apply_goals
  after insert on public.collections
  for each row execute function public.apply_new_collection_goals();

create trigger user_collections_apply_goals
  after insert on public.user_collections
  for each row execute function public.apply_new_collection_goals();

-- Leaving a collection drops its goals.
create function public.drop_left_collection_goals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.collection_goals
  where user_id = old.user_id and collection_id = old.collection_id;
  return old;
end;
$$;

revoke all on function public.drop_left_collection_goals() from public;

create trigger user_collections_drop_goals
  after delete on public.user_collections
  for each row execute function public.drop_left_collection_goals();

-- Members who had goals keep them on every collection in their library, and
-- today's celebrations carry over so nothing celebrates twice on deploy day.
insert into public.collection_goals (
  user_id, collection_id, read_goal, review_goal, quiz_goal, celebrated_on, celebrated_tiers
)
select
  us.user_id,
  lib.collection_id,
  public.goal_value(us.daily_goals -> 'read'),
  public.goal_value(us.daily_goals -> 'review'),
  public.goal_value(us.daily_goals -> 'quiz'),
  case when us.goal_celebrated ->> 'date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    then (us.goal_celebrated ->> 'date')::date end,
  case when jsonb_typeof(us.goal_celebrated -> 'tiers') = 'array'
    then array(select jsonb_array_elements_text(us.goal_celebrated -> 'tiers'))
    else '{}'::text[] end
from public.user_settings us
cross join lateral (
  select c.id as collection_id from public.collections c where c.owner_id = us.user_id
  union
  select uc.collection_id from public.user_collections uc where uc.user_id = us.user_id
) lib
where us.daily_goals is not null
  and (
    public.goal_value(us.daily_goals -> 'read') is not null
    or public.goal_value(us.daily_goals -> 'review') is not null
    or public.goal_value(us.daily_goals -> 'quiz') is not null
  )
on conflict do nothing;

alter table public.user_settings
  drop column daily_goals,
  drop column goal_celebrated;
