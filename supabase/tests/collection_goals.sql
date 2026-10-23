-- Daily goals per collection: counts, celebration claims, "all collections",
-- the new-collection default and cleanup on leaving. One transaction that
-- rolls back:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/collection_goals.sql
begin;

create function pg_temp.make_user(p_email text)
returns uuid
language plpgsql
as $$
declare
  v_id uuid := gen_random_uuid();
  v_code text := 'T' || replace(gen_random_uuid()::text, '-', '');
begin
  insert into public.referral_codes (code) values (v_code);
  insert into auth.users (id, email, raw_user_meta_data, aud, role)
  values (v_id, p_email, jsonb_build_object('referral_code', v_code), 'authenticated', 'authenticated');
  return v_id;
end;
$$;

create function pg_temp.act_as(p_user uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end;
$$;

create function pg_temp.goals(p_read int, p_review int, p_quiz int)
returns jsonb
language sql
as $$
  select jsonb_build_object('read', p_read, 'review', p_review, 'quiz', p_quiz);
$$;

do $$
declare
  u uuid := pg_temp.make_user('cg-member@example.test');
  other uuid := pg_temp.make_user('cg-other@example.test');
  a uuid;
  b uuid;
  c uuid;
  shared uuid;
  t_a1 uuid;
  t_a2 uuid;
  t_b1 uuid;
  v_counts record;
  v_failed boolean;
begin
  insert into public.user_settings (user_id, timezone) values (u, 'UTC')
  on conflict (user_id) do update set timezone = 'UTC';

  insert into public.collections (name, owner_id) values ('CG A', u) returning id into a;
  insert into public.collections (name, owner_id) values ('CG B', u) returning id into b;
  insert into public.terms (collection_id, term, category, definition) values (a, 'a1', 'c', 'd') returning id into t_a1;
  insert into public.terms (collection_id, term, category, definition) values (a, 'a2', 'c', 'd') returning id into t_a2;
  insert into public.terms (collection_id, term, category, definition) values (b, 'b1', 'c', 'd') returning id into t_b1;
  insert into public.review_state (user_id, term_id, last_read_at) values (u, t_a1, now()), (u, t_a2, now());
  insert into public.review_state (user_id, term_id, last_review_recall_at) values (u, t_b1, now());

  -- Counts follow the term's collection.
  select * into v_counts from public.goal_day_counts(u, a);
  assert v_counts.read_count = 2 and v_counts.reviewed_count = 0, 'collection A counts only its own reads';
  select * into v_counts from public.goal_day_counts(u, b);
  assert v_counts.read_count = 0 and v_counts.reviewed_count = 1, 'collection B counts only its own reviews';

  select * into v_counts from public.goal_day_counts(u);
  assert v_counts.read_count = 2 and v_counts.reviewed_count = 1, 'no collection counts all of them';

  perform pg_temp.act_as(u);

  -- A save to one collection leaves the others without goals.
  perform public.my_save_collection_goals(a, pg_temp.goals(2, 1, null), false, null);
  execute 'reset role';
  assert (select read_goal = 2 and review_goal = 1 and quiz_goal is null from public.collection_goals where user_id = u and collection_id = a), 'goals saved for A';
  assert not exists (select 1 from public.collection_goals where user_id = u and collection_id = b), 'B has no goals';
  assert (select new_collection_goals is null from public.user_settings where user_id = u), 'a single save leaves the default alone';

  -- A celebration is claimed once per tier, from the server count.
  perform pg_temp.act_as(u);
  assert public.my_claim_goal_celebration(a, 'read', false), 'read goal met in A';
  assert not public.my_claim_goal_celebration(a, 'read', false), 'read celebrates once a day';
  assert not public.my_claim_goal_celebration(a, 'review', false), 'A has no reviews, so review is not met';
  assert public.my_claim_goal_celebration(a, 'review', true), 'running out of terms counts as met';
  assert not public.my_claim_goal_celebration(b, 'review', false), 'B has no goal row';
  assert (select celebrated @> array['read', 'review'] from public.my_get_goal_day(a)), 'both tiers are marked for A';
  assert (select celebrated = '{}' from public.my_get_goal_day(b)), 'nothing is marked for B';

  -- Raising reopens that tier only; lowering does not.
  perform public.my_save_collection_goals(a, pg_temp.goals(5, 1, null), false, null);
  assert (select celebrated = array['review'] from public.my_get_goal_day(a)), 'raising read reopens read only';
  perform public.my_save_collection_goals(a, pg_temp.goals(5, null, null), false, null);
  perform public.my_save_collection_goals(a, pg_temp.goals(5, 1, null), false, null);
  assert (select celebrated = '{}' from public.my_get_goal_day(a)), 'turning review back on reopens it';

  -- All collections copies only the edited tiers and sets the default.
  perform public.my_save_collection_goals(b, pg_temp.goals(null, 20, null), true, array['review']);
  execute 'reset role';
  assert (select review_goal = 20 from public.collection_goals where user_id = u and collection_id = b), 'B gets the review goal';
  assert (select review_goal = 20 and read_goal = 5 from public.collection_goals where user_id = u and collection_id = a), 'A gets review 20 and keeps read 5';
  assert (select new_collection_goals = pg_temp.goals(null, 20, null) from public.user_settings where user_id = u), 'the default holds the edited tier';

  -- A collection added later starts with the default.
  insert into public.collections (name, owner_id) values ('CG C', u) returning id into c;
  assert (select review_goal = 20 and read_goal is null from public.collection_goals where user_id = u and collection_id = c), 'a created collection gets the default';
  insert into public.collections (name, owner_id, visibility) values ('CG Shared', other, 'shared') returning id into shared;
  insert into public.user_collections (user_id, collection_id) values (u, shared);
  assert exists (select 1 from public.collection_goals where user_id = u and collection_id = shared), 'an added collection gets the default';

  -- Leaving a collection drops its goals.
  delete from public.user_collections where user_id = u and collection_id = shared;
  assert not exists (select 1 from public.collection_goals where user_id = u and collection_id = shared), 'leaving drops the goals';

  -- A collection outside the library is refused.
  perform pg_temp.act_as(other);
  v_failed := false;
  begin perform public.my_save_collection_goals(a, pg_temp.goals(5, 5, 5), false, null);
  exception when others then v_failed := sqlerrm like 'Collection is not in your library%'; end;
  assert v_failed, 'saving goals for a stranger''s collection was allowed';

  -- Turning every tier off for all collections clears rows and the default.
  perform pg_temp.act_as(u);
  perform public.my_save_collection_goals(a, pg_temp.goals(null, null, null), true, null);
  execute 'reset role';
  assert not exists (select 1 from public.collection_goals where user_id = u), 'no goals remain';
  assert (select new_collection_goals is null from public.user_settings where user_id = u), 'the default is cleared';
end;
$$;

rollback;
