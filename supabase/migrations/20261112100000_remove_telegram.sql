-- Removes the Telegram bot: its cron job, functions, link table and enum.
-- Nothing else reads telegram_links; it cascades from users, so deleting an
-- account needs no change. The Vault secrets cron_telegram_secret and
-- cron_project_url are not touched here; delete them by hand.

do $$
declare
  v_job bigint;
begin
  if to_regnamespace('cron') is null then
    return;
  end if;

  select jobid into v_job from cron.job where jobname = 'telegram-send-due';
  if v_job is not null then
    perform cron.unschedule(v_job);
  end if;

  -- 20261024120000_cron_from_vault.sql only scheduled narration-sync when all
  -- four secrets existed, two of which were Telegram's. Schedule it from its own
  -- two on a project that never got it.
  if to_regnamespace('vault') is not null
    and not exists (select 1 from cron.job where jobname = 'narration-sync')
    and (
      select count(*) = 2 from vault.decrypted_secrets
      where name in ('cron_app_url', 'cron_ai_internal_secret')
    )
  then
    perform cron.schedule(
      'narration-sync',
      '* * * * *',
      $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'cron_app_url')
          || '/api/internal/narration/sync',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_ai_internal_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 1000
      );
      $job$
    );
  end if;
end;
$$;

drop function if exists public.complete_telegram_link(text, bigint);
drop function if exists public.list_due_telegram_users();
drop function if exists public.update_telegram_cadence(public.telegram_cadence);
drop function if exists public.record_telegram_send(uuid);
drop function if exists public.set_telegram_all_caught_up(uuid);

drop table if exists public.telegram_links;
drop type if exists public.telegram_cadence;

comment on column public.user_settings.timezone is
  'IANA tz, client-detected via Intl.DateTimeFormat and silently saved on login. Sets the day boundary for the streak (bump_streak, get_streak_history) and the Mastery page''s today counts. Null before the first web login; both then fall back to ''Europe/Amsterdam'', STUDY_TIMEZONE in lib/trace/local-day.ts (keep the two in sync by hand).';
