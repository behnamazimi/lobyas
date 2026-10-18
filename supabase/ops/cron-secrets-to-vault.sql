-- One-off. Run in the Supabase SQL Editor BEFORE the cron_from_vault migration.
--
-- The narration-sync job was created by hand with its bearer token written into
-- cron.job. This copies the token (and the app URL) into Vault under new names,
-- without printing any value, so the migration can schedule the job from Vault.
-- Safe to run twice.
--
-- It does not delete anything. After the migration has run and the job has
-- ticked, the older Vault entries listed at the end can be removed by hand.

do $$
declare
  v_narration text;
  v_ai_secret text;
  v_app_url text;
begin
  select command into v_narration from cron.job where jobname = 'narration-sync';

  if v_narration is null then
    raise exception 'Expected the narration-sync job in cron.job.';
  end if;

  v_ai_secret := (regexp_match(v_narration, 'Bearer ([^"\s]+)'))[1];
  v_app_url := (regexp_match(v_narration, 'url\s*:=\s*''(https://[^/'']+)'))[1];

  if v_ai_secret is null or v_app_url is null then
    if v_narration like '%vault.decrypted_secrets%' then
      raise notice 'The job already reads from Vault; nothing to copy.';
      return;
    end if;
    raise exception 'Could not read a token or URL from the current cron command.';
  end if;

  if not exists (select 1 from vault.secrets where name = 'cron_ai_internal_secret') then
    perform vault.create_secret(v_ai_secret, 'cron_ai_internal_secret', 'Bearer token for the narration-sync cron job');
  end if;
  if not exists (select 1 from vault.secrets where name = 'cron_app_url') then
    perform vault.create_secret(v_app_url, 'cron_app_url', 'Base URL of the app, used by the narration-sync cron job');
  end if;
end;
$$;

-- Names only. The cron_* entries are the ones the job uses; the rest are
-- older entries nothing reads any more.
select name, created_at
from vault.secrets
order by (name like 'cron\_%') desc, name;
