# Mobile app (Capacitor)

The Android and iOS apps are a Capacitor 8 shell around the live site. The web
app is server-rendered (Server Actions, a cookie session in `proxy.ts`), so it
can't be bundled: `capacitor.config.ts` sets `server.url` to
`https://lobyas.com` and the shell just loads it. A web deploy reaches the apps
at once; a store release is only needed for native changes.

## Layout

- `capacitor.config.ts`: app id `com.lobyas.app`, the server URL, and
  `allowNavigation` (only lobyas.com; other links leave the app).
- `native/www/`: the only bundled pages. `offline.html` is shown by
  `server.errorPath` when the site can't be reached; its button always goes to
  lobyas.com, even in a preview build.
- `ios/` (Swift Package Manager) and `android/`: committed native projects.
  `ios/` and `android/` are skipped by oxlint, oxfmt, knip and Vercel.
- `resources/icon-only.png`, `resources/splash.png`: the source art. Run
  `pnpm mobile:assets` after changing them. Both were rendered from
  `BrandMarkImage` / `BrandSplash` in `lib/brand-icon.tsx`.
- `fastlane/` and `Gemfile`: the signed upload lanes CI uses.

## Working on it

```bash
pnpm mobile:sync       # copy config and plugins into ios/ and android/; run it after pnpm install
pnpm mobile:android    # open Android Studio
pnpm mobile:ios        # open Xcode
```

To try a branch, point the shell at any URL (a Vercel preview, or your machine
on the same network) before syncing:

```bash
CAP_SERVER_URL=https://<preview>.vercel.app pnpm mobile:sync
```

The app shows whatever the site serves, so a web change (CSS, a component) only
appears in an app that points at a deploy containing it. To get an APK for a
branch, run the Mobile workflow manually and put the branch's Vercel preview URL
in `server_url`; download the APK from the run's artifacts.

## Telling the app from a browser

The shell adds `LobyasApp/ios/<version>` or `LobyasApp/android/<version>` to the
WebView's user agent (`ios.appendUserAgent` / `android.appendUserAgent`). The version is the
release tag's (`mobile-vX.Y.Z`), passed to `cap sync` as `CAP_APP_VERSION`, so it is the store
version. A local build reports `999.0.0`, which no update prompt replaces. Apps built
before that send `LobyasApp/<os>` or plain `LobyasApp`, so the os or the version can be unknown
(`useShell()` gives `version: null`). Everything reads it through
`lib/native/shell.ts`, and there is no cookie: the user agent is on every
request, including the first, and a cookie would make the cached public pages
dynamic.

- Component: `const { native, os } = useShell()` (`hooks/use-shell.ts`). It
  reports "not native" on the server and during hydration, then the real value.
- Event handler or effect: `isNativeShell()`.
- CSS: `native-app:`, `ios-app:` and `android-app:` variants. An inline script
  copies the user agent to `data-shell` on `<html>` before paint, so cached pages
  need no server work.

It is a hint for the UI only; anything that must be restricted to the app still
needs the `x-lobyas-native` header or a server check. Load Capacitor plugins with
a dynamic `import()` inside a check for it, and assume an installed app may be
older than the web code: a plugin added later won't exist in it.

The proxy uses it for one thing: a request for `/` from the app redirects to the
study area (`AUTHENTICATED_HOME_PATH`) for a signed-in member, or to `/login`
otherwise (`lib/native/landing.ts`). Every other public page still opens by link.

## Asking old apps to update

`NativeUpdateGate` (mounted in the root layout) reads the version from `useShell()` and
compares it with `UPDATE_POLICY` in `lib/native/update-policy.ts`. Below `recommended` it shows a
dismissible banner (dismissal is remembered per recommended version); below `required` it
covers the app with an Update screen. An app that reports no version counts as `0.0.0`. Both
floors start at `0.0.0`, so nobody is prompted. Raise one only after a store build with that
version has been released, and set `APP_STORE_URL` in the same file first: without a store link
the screen has no Update button. Check on a device that the store links open the store app.

## Haptics and sounds

Call `feedback(cue)` from `lib/feedback/`; its table in `index.ts` decides
what each cue plays. Haptics (`haptics.ts`, `@capacitor/haptics`) run only
inside the app and do nothing on the web or in an app built before the plugin.
Sounds (`sounds.ts`) are synthesized with Web Audio, play on the web and in the
app, and are used by the quiz only.

## Launch

The shell opens `/app` directly (not `/`), so a launch has no redirect hop;
the proxy sends a signed-out member on to login. The splash stays up until the
page has painted: `NativeSplash` hides it, and `launchShowDuration` (4s) hides it
anyway when the site is slow or `offline.html` loads. These are native settings,
so they reach users with the next store release.

## Offline and the service worker

The site's service worker (`app/sw.ts`, which serves the `/~offline` page and the
offline banner) runs inside the apps too. Android's WebView allows it on https.
iOS's WKWebView only allows it for App-Bound Domains, so `Info.plist` lists
`lobyas.com` under `WKAppBoundDomains` and `capacitor.config.ts` sets
`ios.limitsNavigationsToAppBoundDomains`. `localhost` is listed too: the bundled
`offline.html` loads from it. The webview can then only navigate to those hosts,
and a navigation to any other host (a subdomain such as `www` included, until
tested on a device) fails instead of opening in Safari. Sign-in goes through the
system browser and is not affected. The flag is off when `CAP_SERVER_URL` points
at a preview, because the preview host isn't in the list; a preview build on iOS
has no service worker and falls back to `native/www/offline.html`.

Capacitor Android would also show `offline.html` for any HTTP error on a page
load (404, 5xx). `MainActivity` replaces its client so only a failed connection
does; an error page from the site is shown as is. Offline, Android's WebView
also reports the service worker's navigation preload request as a failed page
load, and Capacitor would swap in `offline.html` before the worker answers.
`MainActivity` ignores errors on requests with the
`Service-Worker-Navigation-Preload` header, so `offline.html` only shows when
no service worker is installed yet (first launch while offline).

After changing either setting run `pnpm mobile:sync`, then test on a real iPhone:
load the app, turn on airplane mode, and open a page. It should show `/~offline`,
not `offline.html`.

## Google sign-in

Google refuses sign-in inside a WebView, so `GoogleSignInButton` calls
`POST /auth/native/google` from the WebView (the `x-lobyas-native` header keeps a
cross-site form from calling it), which stores the sign-in cookie there. It
opens the returned URL in the system browser, and Supabase sends the
user back to `com.lobyas.app://auth/callback?code=…`. `NativeAuthBridge`
catches that link (`parseAuthDeepLink`, which accepts only that exact link and
sanitises `next`) and loads `/auth/callback` in the WebView, which exchanges the
code. The scheme is registered in `AndroidManifest.xml` and `Info.plist`, and
must be in Supabase's redirect allow list (`supabase/config.toml` locally, the
dashboard for hosted projects). A link that reopens a fully closed app is not
handled; the user just taps the button again.

## Sign in with Apple

`AppleSignInButton` sits under Google on the login and signup pages. In the iOS app it opens
the system Apple sheet (`@capgo/capacitor-social-login`, loaded with a dynamic `import()` and
shown only when `Capacitor.isPluginAvailable("SocialLogin")`, so older installs just don't see it).
In browsers it uses Apple's popup script and needs `NEXT_PUBLIC_APPLE_SERVICES_ID`; without it
(previews, local dev; Apple rejects `localhost`) the button is hidden. The Android app has
neither, so it shows no Apple button.

Both paths get an ID token and POST it with the raw nonce to `POST /auth/apple`
(`lib/auth/apple-sign-in.ts`), which calls Supabase `signInWithIdToken` and returns
`{ redirectTo }`; `finishSignIn` (`lib/auth/after-sign-in.ts`) redeems the referral code and
tracks the sign-in, shared with `/auth/callback`. The nonce Apple signs is the SHA-256 of the raw
one (`lib/auth/apple-client.ts`). The route only accepts JSON, so a cross-site form can't sign
someone in with an attacker's token.

Apple sends the name and email only on the first authorization. "Hide My Email" gives a
`privaterelay.appleid.com` address that never matches an existing account, so that person gets a
separate account; Supabase links by email only when the real address is shared.
`enable_manual_linking` is off. Resend must send from a domain registered under Apple's
"Sign in with Apple for Email Communication", or mail to relay addresses is dropped.

Setup outside the repo: enable the capability on the App ID (the build's `App.entitlements`
needs it in the provisioning profile, so run the Mobile signing workflow with force ticked after), create a
Services ID with `lobyas.com`, and enable the Apple provider in the hosted Supabase project with
both the bundle id and the Services ID as client ids. Local Supabase keeps Apple off.

Not done yet: Apple requires revoking the person's Apple token when they delete their account
(`delete_own_account`). That needs the authorization code from a fresh Apple sign-in and a `.p8`
key on the server.

## Releasing

The apps load the live site, so a web deploy reaches them at once. A store release is needed
only when something native changes: `capacitor.config.ts`, `native/`, `ios/`, `android/`,
`fastlane/`, `resources/`, the Gemfile, or a Capacitor plugin in `package.json`. Releases are
manual, one command each, and run in CI so every build uses the same Xcode, Ruby and signing.

```bash
pnpm mobile:release minor      # or patch, major, or a version like 1.2.3
pnpm mobile:promote both       # later, when the beta build has been tried
```

`pnpm mobile:release` (`scripts/mobile-release.sh`) needs `gh auth login`. It refuses to
continue unless you are on an up-to-date `main` with a green CI run on that commit and native
files changed since the last `mobile-v*` tag (`--force` overrides the last one, `--dry-run` only
prints the plan). Then it pushes the tag `mobile-vX.Y.Z` and follows the Mobile workflow, which
builds, signs and uploads to TestFlight and the Play internal track. The tag is the single
source of the version; the workflow rejects a tag that isn't on `main`. The build number is
the workflow run number. If the run fails, fix the cause and use "Re-run failed jobs": the build
number keeps rising.

`pnpm mobile:promote` (`scripts/mobile-promote.sh`) starts the Mobile promote workflow for the
latest tag (or `--version`): Android moves the Play internal release to production at
`--rollout` percent (default 10; run it again with a higher number to widen), and iOS submits
the TestFlight build for App Store review as a phased release. Both are manual because they
can't be taken back. The first release of each store is done by hand (see CI below), and the
iOS lane needs the version's metadata and screenshots already filled in App Store Connect; it
has not been run against the real stores yet.

There is no approval gate on the `Mobile release` environment: running the script is the
decision. Don't add required reviewers, because the weekly Mobile health run uses the same
secrets and would wait for one.

Reliability:

- **Mobile health** (`.github/workflows/mobile-health.yml`, Mondays) runs the secret check,
  confirms the App Store Connect key works and the app exists, reads the signing profile's
  expiry (fails under 30 days; fix with Mobile signing and "force"), and tells the ops chat when
  native changes have waited a week without a release.
- **Alerts**: `notify.yml` posts failures of Mobile, Mobile signing and Mobile promote, and a
  message when a release is uploaded or promoted (see [monitoring.md](monitoring.md)).
- **Xcode**: iOS jobs use the newest stable Xcode and print its version. To pin one (before
  Apple's yearly SDK deadline, or when a new Xcode breaks a build), set the repository
  variable `XCODE_VERSION` (Settings, Secrets and variables, Variables); remove it to follow
  the latest again.
- **Yearly**: the signing profile expires after a year, and the GitHub token for the match repo
  has the expiry you gave it. Mobile health warns about the profile; renew the token yourself.

## CI

`.github/workflows/mobile.yml`:

| Trigger                              | What runs                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| Pull request touching native files   | Unsigned Android debug build, iOS simulator build                |
| Tag `mobile-vX.Y.Z`                  | Signed builds, uploaded to Play internal and TestFlight          |
| Manual run on such a tag with upload | Same as above (a manual run without upload is an unsigned build) |

Signed jobs run in the `Mobile release` environment. Secrets:

| Secret                                                                                              | For                                                                                           |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Upload key                                                                                    |
| `PLAY_SERVICE_ACCOUNT_JSON`                                                                         | Play Console API access                                                                       |
| `APPLE_TEAM_ID`                                                                                     | Signing team                                                                                  |
| `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY`                  | App Store Connect API key (the `.p8` file, base64-encoded: `base64 -i AuthKey_XXXX.p8`)       |
| `MATCH_GIT_URL`, `MATCH_GIT_BASIC_AUTHORIZATION`, `MATCH_PASSWORD`                                  | fastlane `match` certificate repo (`MATCH_GIT_BASIC_AUTHORIZATION` is base64 of `user:token`) |

Set them all at once: copy `.env.mobile.example` to `.env.mobile`, fill it in, and run
`scripts/set-mobile-secrets.sh` (needs `gh auth login`). It builds
`MATCH_GIT_BASIC_AUTHORIZATION` from the GitHub user and token for you.

### iOS signing

iOS releases sign with fastlane `match`: an encrypted certificate and provisioning
profile live in a private Git repo (`MATCH_GIT_URL`), and the release lane only reads
them (`readonly`). Nothing creates them during a release, so run the **Mobile signing**
workflow (`.github/workflows/mobile-signing.yml`, lane `ios signing`) first:

- once, before the first release;
- with **force** ticked after a capability changes on the app id (Sign in with Apple
  needed this), so the profile is rebuilt with it;
- when the profile expires (a year after it was made). If the certificate itself has
  expired, run `fastlane match nuke distribution` from a Mac, then the workflow.

The profile name must stay `match AppStore com.lobyas.app` (`PROFILE_NAME` in the
`Fastfile`). Keep `MATCH_PASSWORD` in a password manager: without it the stored
certificate can't be read.

One-time setup outside the repo: create both apps (`com.lobyas.app`) in App Store
Connect and Play Console, add `com.lobyas.app://auth/**` to the hosted Supabase
project's redirect URLs, and upload a first bundle to Play by hand (the API can't
create the first release of a new app).
