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

To run the iOS simulator against `pnpm dev`, sync with `CAP_SERVER_URL=http://localhost:3000` and
build the Debug configuration from Xcode (or `xcodebuild`). `Info.plist` is preprocessed, and the App
Transport Security exception for local http sits in an `#ifdef LOCAL_BUILD` block that only the Debug
configuration defines; release and archive builds never have it.
On the Android emulator the host is `10.0.2.2`, so sync with `CAP_SERVER_URL=http://10.0.2.2:3000` and
run `./gradlew assembleDebug` in `android/`. The debug-only manifest (`android/app/src/debug/`) allows
cleartext http, and `allowedDevOrigins` in `next.config.ts` lets `next dev` serve that origin; without
it the page loads but never hydrates.

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
(`useNative()` gives `version: null`). Everything reads it through
`lib/native/shell.ts`, and there is no cookie: the user agent is on every
request, including the first, and a cookie would make the cached public pages
dynamic.

- Component: `const { native, os } = useNative()` (`hooks/use-native.ts`). It
  reports "not native" on the server and during hydration, then the real value.
- Event handler or effect: `isNativeShell()`.
- CSS: `native-app:`, `ios-app:` and `android-app:` variants. An inline script
  copies the user agent to `data-shell` on `<html>` before paint, so cached pages
  need no server work.

It is a hint for the UI only; anything that must be restricted to the app still
needs the `x-lobyas-native` header or a server check. Never import a Capacitor
plugin: everything the web code says to the app goes through `lib/native/`, which
answers "unavailable" for an app that was built without the plugin
([native-bridge.md](native-bridge.md)).

The proxy uses it for one thing: a request for `/` from the app redirects to the
study area (`AUTHENTICATED_HOME_PATH`) for a signed-in member, or to `/login`
otherwise (`lib/native/landing.ts`). Every other public page still opens by link.

## Reminders

Study reminders are local notifications (`@capacitor/local-notifications`), set on the Goals page
(`components/goals/reminders-card.tsx`) and kept in `user_settings.reminders` (up to 3 of
`{id, time "HH:MM", days 1 = Mon…7 = Sun, enabled}`, local wall-clock time). The card renders only
in an app whose binary has the plugin (`hasCapability("notifications")` in `lib/native/capabilities.ts`), so
older apps and the web never show it.

- Each enabled reminder becomes one repeating weekly OS schedule per weekday
  (`lib/reminders/schedule.ts`). They survive reboots and follow DST and travel, but can't skip a
  day already studied. The id is `(position + 1) * 10 + weekday`, and the three lobya lines rotate by weekday.
- `NativeReminders` (root layout) reads `GET /api/reminders` on launch, whenever the app returns
  to the foreground and when the visitor signs in, and rearms only if the pending ids, the saved
  schedule or the device timezone differ (`lib/reminders/arming.ts`). Everything that changes what the
  device holds runs through one queue in `lib/reminders/device.ts`, so an older sync can't land after a
  newer save. A save sends one change (add, edit or remove) that the server applies to the stored list. Signed out (a 401 or a redirect to login) clears everything; sign-out and account deletion also clear first.
- The permission prompt appears only when the first reminder is saved. If it is denied or revoked,
  the card shows an alert with an Open settings button (`capacitor-native-settings`).
- Android uses inexact alarms (a reminder can be a few minutes late; every notification sets
  `isExactNotification: false`, since an exact alarm sends Android 12+ to a settings screen) in a
  "Reminders" channel with the `ic_stat_lobyas` small icon. Tapping one opens `/app`.

Check on a real iOS and Android device before a release: the permission prompt on the first save;
denying it shows the alert and Open settings works; revoking in system settings and returning
updates the card; a reminder fires after a reboot; changing the timezone moves it with the phone;
signing out stops reminders and signing back in restores them; a tap opens Home; two devices on
one account both ring.

Reminder times follow the phone's 12 or 24-hour setting, read through the app's own `LobyasNative`
plugin (`lib/native/clock.ts`); see [native-bridge.md](native-bridge.md).

## Asking old apps to update

`NativeUpdateGate` (mounted in the root layout) reads the version from `useNative()` and
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
the proxy sends a signed-out member on to login.

The splash is the app icon (the tile with the clipped lobya), the same on iOS and Android,
light and dark, and always 108pt/dp. The native part is static: the iOS launch storyboard
centres the `Splash` image in a 240pt box, and Android uses the system splash with
`splash_icon` (`styles.xml`, `values-night/`), a 288dp frame whose 192dp circle the tile
fits inside. Light and dark follow the phone, not the app's own theme (which defaults to light).
`pnpm mobile:splash` renders `resources/splash*.png` and the Android `splash_icon` files from
`brandMarkSvg` (`lib/brand-icon.tsx`) (about a minute and a half); run it after changing the icon, then
`pnpm mobile:assets`, which rewrites the launcher icons too (revert those if the icon didn't change).

`NativeSplashFrame` draws the same picture in the page (`#native-splash`, shown by
`html[data-splash]`, which `SPLASH_RESTORE_SCRIPT` sets only in a new web view), and
`NativeSplash` runs it. Once the frame has painted the native splash is hidden, and the
frame blinks until the page the web view loaded is shown: it must not be a server error
(5xx, read from the navigation entry's `responseStatus`; a web view that doesn't report it
counts as fine). A server error reloads once behind the native splash, then is shown as it is.
The frame is held for at least 700ms (not under reduced motion) and fades out. If the page
never removes it, CSS hides it after 15s. `launchShowDuration` (12s) hides the native splash
if the page never loads at all; `native/www/offline.html` hides it itself, since it has no
app code. These are native settings, so they reach users with the next store release.

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
the system Apple sheet (`@capgo/capacitor-social-login`, wrapped in `lib/native/social-login.ts` and
shown only when `hasCapability("appleSignIn")`, so older installs just don't see it).
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
`fastlane/`, `resources/`, the Gemfile, or a Capacitor plugin in `package.json`. A beta release
is one command and runs in CI, so every build uses the same Xcode, Ruby and signing:

```bash
pnpm mobile:release            # shows what changed, then asks patch, minor or major
pnpm mobile:release minor      # or give the bump (or a version like 1.2.3) up front
```

`pnpm mobile:release` (`scripts/mobile-release.sh`) needs `gh auth login`. It refuses to
continue unless you are on an up-to-date `main` with a green CI run on that commit and native
files changed since the last `mobile-v*` tag (`--force` overrides the last one, `--dry-run` only
prints the plan). Then it pushes the tag `mobile-vX.Y.Z` and follows the Mobile workflow, which
builds, signs and uploads to TestFlight and the Play internal track. The tag is the single
source of the version; the workflow rejects a tag that isn't on `main`. The build number is
the workflow run number. If the run fails, fix the cause and use "Re-run failed jobs": the build
number keeps rising.

### Going public

Moving a beta build to the public stores is done in the consoles. It is a few clicks, it
can't be taken back, and the listing, screenshots, age rating, privacy answers and App Review
details are filled in there anyway, so it isn't scripted.

- **App Store**: App Store Connect, the app, "+ Version" with the tag's version (for example
  1.2.0), choose the TestFlight build, fill in "What's New", Add for Review. Choose a phased
  release and "Manually release" so you control the day it goes live.
- **Play**: Play Console, Testing, Internal testing, "Promote release" to Production. Start at a
  staged percentage (for example 10) and raise it as crash-free numbers hold.

If doing this by hand becomes a chore, script the step that hurts (fastlane `deliver` and
`supply` do it); it was left out until the manual flow has run a few times.

There is no approval gate on the `Mobile release` environment: running the script is the
decision. Don't add required reviewers, because the monthly Mobile health run uses the same
secrets and would wait for one.

Reliability:

- **Mobile health** (`.github/workflows/mobile-health.yml`, the 1st of each month, on macOS
  because `match` needs a keychain) runs the secret check, confirms the App Store Connect key
  works and the app exists, and reads the signing profile's expiry. It fails under 30 days; fix
  that with Mobile signing and "force". A failure reaches the ops chat.
- **Alerts**: `notify.yml` posts failures of Mobile and Mobile signing, and a message when a
  release is uploaded (see [monitoring.md](monitoring.md)).
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

### Android signing and the first upload

Play signs the app that users install (Play App Signing, on by default for new apps). You sign
each bundle with an **upload key** that you create once and keep; if it is lost, Play can reset
it from the console.

1. Create the upload keystore (needs a JDK; Android Studio includes one). Pick a password and
   store the file and the password in your password manager. They are never committed.

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore lobyas-upload.keystore \
     -alias lobyas-upload -keyalg RSA -keysize 2048 -validity 10000
   ```

   With PKCS12 the key password is the store password.

2. Create the Play service account the workflow uploads with: in Google Cloud, enable the
   "Google Play Android Developer API", create a service account and a JSON key. In Play
   Console, Users and permissions, invite the service account's email with access to the app:
   "Release apps to testing tracks" (add "Release to production" for later). It can take a
   few hours to start working.
3. Fill the Android lines in `.env.mobile` (`ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS` = `lobyas-upload`, `ANDROID_KEY_PASSWORD`, `PLAY_SERVICE_ACCOUNT_FILE`)
   and run `scripts/set-mobile-secrets.sh`.
4. In Play Console create the app (`com.lobyas.app`). The API can't create the first release,
   so run the first release (`pnpm mobile:release`); the Android upload step fails, which is
   expected once. Download the `lobyas-release-aab` artifact from that run, and in Play Console
   (Testing, Internal testing, Create new release) upload it by hand and add yourself as a
   tester. From then on `pnpm mobile:release` uploads to the internal track by itself.

A personal Play developer account made after November 2023 must run a closed test with
enough testers for 14 days before Play allows a production release. Start that early.

One-time setup outside the repo: create the iOS app (`com.lobyas.app`) in App Store Connect, and
add `com.lobyas.app://auth/**` to the hosted Supabase project's redirect URLs.
