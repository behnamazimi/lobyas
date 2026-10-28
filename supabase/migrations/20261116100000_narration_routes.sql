-- Google WaveNet and Gemini join Murf and ElevenLabs as narration providers.
-- Which one is tried first depends on what is narrated: a word or phrase of a
-- vocabulary collection, any other term, or a story. The others stay fallbacks.

alter table public.audio_jobs
  drop constraint audio_jobs_provider_check,
  add constraint audio_jobs_provider_check
    check (provider in ('murf', 'elevenlabs', 'google', 'gemini'));

alter table public.ai_usage_events
  drop constraint ai_usage_events_provider_check,
  add constraint ai_usage_events_provider_check
    check (provider in ('murf', 'elevenlabs', 'google', 'gemini'));

create table public.narration_routes (
  route text primary key check (route in ('vocab_term', 'term', 'story')),
  provider text not null check (provider in ('murf', 'elevenlabs', 'google', 'gemini')),
  updated_at timestamptz not null default now()
);

insert into public.narration_routes (route, provider)
values ('vocab_term', 'google'), ('term', 'gemini'), ('story', 'gemini');

alter table public.narration_routes enable row level security;
create policy "Signed-in users read narration routes"
  on public.narration_routes for select to authenticated using (true);

create trigger narration_routes_set_updated_at
  before update on public.narration_routes
  for each row execute function public.set_updated_at();

create function public.admin_set_narration_route(p_route text, p_provider text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Only admins can change narration settings';
  end if;
  if p_provider is null or p_provider not in ('murf', 'elevenlabs', 'google', 'gemini') then
    raise exception 'Unknown narration provider';
  end if;

  update public.narration_routes set provider = p_provider where route = p_route;
  if not found then
    raise exception 'Unknown narration route';
  end if;

  perform public._admin_audit_insert(
    'set_narration_route',
    'feature',
    'narration',
    jsonb_build_object('route', p_route, 'provider', p_provider)
  );
end;
$$;

revoke all on function public.admin_set_narration_route(text, text) from public, anon;
grant execute on function public.admin_set_narration_route(text, text) to authenticated;
