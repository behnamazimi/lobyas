import { callNative } from "./call";

/** Opens the system settings screen for this app's notifications. */
export async function openNotificationSettings(): Promise<boolean> {
  const result = await callNative(
    "appSettings",
    () => import("capacitor-native-settings"),
    ({ AndroidSettings, IOSSettings, NativeSettings }) =>
      NativeSettings.open({
        optionAndroid: AndroidSettings.AppNotification,
        optionIOS: IOSSettings.AppNotification,
      }),
  );
  return result.status === "ok";
}
