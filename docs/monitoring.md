# DevOps monitoring (Telegram)

A Telegram bot posts the things that need a human to a private ops chat. Its
token lives only in GitHub secrets, because a monitor must not depend on the
app it watches. The bot only sends; it has no webhook.

## What reaches the chat

| Alert                        | Source                                | When                                                                                |
| ---------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| CI failed on `main`          | `.github/workflows/notify.yml`        | A push to `main` fails. Names the failed jobs.                                      |
| CI green again               | same                                  | The first green run after a failed one.                                             |
| Production deployed / failed | same                                  | `Deploy production` finishes. Covers the migration push and the Vercel deploy.      |
| Mobile release uploaded      | `.github/workflows/notify.yml`        | A `mobile-v*` tag finishes building.                                                |
| Mobile workflow failed       | same                                  | A release or signing run fails (pull request builds are left out).                  |
| Mobile setup needs attention | `.github/workflows/mobile-health.yml` | Monthly: the App Store Connect key, signing repo or profile is failing or expiring. |
| Many AI requests refunded    | `.github/workflows/ai-health.yml`     | Every 3 hours, when `refundsLookHigh` is true. Repeats until it clears.             |
| AI health check couldn't run | same                                  | The app was unreachable or the secret is wrong.                                     |

Pull request runs are left out on purpose: the author already sees them.

## Setup

1. In [@BotFather](https://t.me/BotFather) run `/newbot` for a new bot.
2. Add the bot to a private chat or group, send a message, then read the chat id
   from `https://api.telegram.org/bot<token>/getUpdates`.
3. Add these GitHub repository secrets:
   - `TELEGRAM_OPS_BOT_TOKEN` and `TELEGRAM_OPS_CHAT_ID`
   - `APP_URL`: the public origin, e.g. `https://lobyas.com`
   - `AI_INTERNAL_SECRET`: the same value the app uses (see
     [narration-sync-cron.md](supabase/narration-sync-cron.md))

Without the two `TELEGRAM_OPS_*` secrets the scripts skip sending, so forks stay green.

## Pieces

- `scripts/notify-telegram.sh` sends `$MESSAGE`. Both workflows use it.
- `app/api/internal/ai-health/route.ts` returns the last day's refund counts
  (`lib/ai-credits/refund-snapshot.ts`). It takes `AI_INTERNAL_SECRET` as a
  bearer token. The rule is the one the admin overview uses
  (`lib/ai-credits/health.ts`), so the chat and the admin panel agree.

## Adding an alert

Prefer a signal that already exists and a message with one link to act on. Add
the workflow or route, send through `scripts/notify-telegram.sh`, and add a row
to the table above. Alert on failures and on a few successes (production
deploys); anything noisier trains people to mute the chat.
