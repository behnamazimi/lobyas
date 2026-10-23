# Native bridge

The iOS and Android apps are a Capacitor shell around the live site (see
[mobile.md](mobile.md)). Everything the web code says to the native layer, or hears from it,
goes through `lib/native/`. Nothing else may import `@capacitor/*`, `@capgo/*` or
`capacitor-native-settings`: `.oxlintrc.json` fails the build (`no-restricted-imports`) for any
file outside `lib/native/` that does. Features call `lib/native`, so one rule decides what an
old app, the web or a denied permission looks like.

## The contract

`lib/native/contract.ts` holds the names both sides agree on. It imports nothing, because
`capacitor.config.ts` reads it too. These files can't import it, so change them together:

| Name           | Value                            | Also written in                                                                                                                  |
| -------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| App id         | `com.lobyas.app`                 | `ios/App/App.xcodeproj` (bundle id), `android/app/build.gradle`, `AndroidManifest.xml`, `Info.plist` URL scheme, Play Store link |
| User agent     | `LobyasApp/<os>/<version>`       | `app/globals.css` does not read it; `SHELL_RESTORE_SCRIPT` copies it to `<html data-shell>`                                      |
| `data-shell`   | `ios`, `android` or `app`        | the `native-app:`, `ios-app:` and `android-app:` variants and `:root[data-shell="android"]` in `app/globals.css`                 |
| Request header | `x-lobyas-native: 1`             | `app/auth/native/google/route.ts` checks it                                                                                      |
| Auth redirect  | `com.lobyas.app://auth/callback` | the URL scheme in `Info.plist` and `AndroidManifest.xml`                                                                         |

`lib/native/shell.test.ts` checks that the user agent the config sends is the one the parser
reads.

`isNativeShell()` (`lib/native/shell.ts`) is the synchronous version of the same question, for event
handlers and effects. `nativePlatform()` reads Capacitor's own platform, which is known for every app
version.

## What crosses the boundary

| Topic                                                    | Direction    | Notes                                                      |
| -------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| Is this the app, which OS and version                    | web reads    | user agent; `proxy` and `landing.ts` read it on the server |
| Open or close the system browser                         | web asks     | Google sign-in                                             |
| Google sign-in finished                                  | native tells | `appUrlOpen` deep link                                     |
| Apple sign-in                                            | web asks     | `@capgo/capacitor-social-login`, iOS only                  |
| Hide the splash, set the status-bar style, haptics       | web asks     |                                                            |
| Notification permission, schedule, cancel, list, channel | web asks     | `@capacitor/local-notifications`                           |
| Open the app's notification settings                     | web asks     | `capacitor-native-settings`                                |
| App comes to the foreground                              | native tells | `appStateChange`                                           |
| A reminder was tapped                                    | native tells | `localNotificationActionPerformed`                         |

Native code owned by the app today: `MainActivity.java` (flushes cookies on pause, keeps a
failed connection from replacing a working page) and the iOS delegates.

## Adding the app's own native code

An app-level plugin is a Capacitor plugin that lives in the app project and is registered by
hand. Registration was checked on Capacitor 8 on both platforms:

- **Android:** a class annotated `@CapacitorPlugin(name = "...")` with `@PluginMethod`
  methods, registered with `registerPlugin(Plugin.class)` in `MainActivity.onCreate` _before_
  `super.onCreate`, because that call builds the bridge.
- **iOS:** a class conforming to `CAPBridgedPlugin` (`identifier`, `jsName`, `pluginMethods`).
  `SceneDelegate` creates the web view controller in code, so it uses a subclass of
  `CAPBridgeViewController` that overrides `capacitorDidLoad()` and calls
  `bridge?.registerPluginInstance(...)`. New Swift files must also be added to the App target
  in `project.pbxproj`.
- **Web:** nothing to install. A registered plugin appears in `Capacitor.Plugins` and
  `Capacitor.isPluginAvailable(name)` is true. Wrap it in `lib/native/` like any other.

An app already installed does not have a plugin added later, so every call must cope with
"unavailable".

## Adding a native call

1. Add the capability and its plugin name to `lib/native/capabilities.ts`.
2. Write the wrapper in its own `lib/native/<feature>.ts` with `callNative`, and expose plain
   functions that say what the feature needs (`openSystemBrowser(url): Promise<boolean>`).
3. Test it with a faked plugin and a faked app (`vi.stubGlobal("navigator", ...)` and
   `vi.stubGlobal("Capacitor", ...)`, see `lib/native/call.test.ts`).
4. Use it from components and `lib/`; never import the plugin there.
