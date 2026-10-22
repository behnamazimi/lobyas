-- Rollback: alter table public.user_settings drop column reminders;
alter table public.user_settings
  add column reminders jsonb not null default '[]';

comment on column public.user_settings.reminders is
  'Study reminders the apps schedule on the device: up to 3 of {id, time "HH:MM", days (1 = Monday to 7 = Sunday), enabled}. Local wall-clock time.';
