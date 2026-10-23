import { callNative } from "./call";

export type HapticKind = "tap" | "success" | "warning";

/** App only; a browser, or an app without the plugin, does nothing. */
export function buzz(kind: HapticKind) {
  void callNative(
    "haptics",
    () => import("@capacitor/haptics"),
    ({ Haptics, ImpactStyle, NotificationType }) => {
      if (kind === "tap") return Haptics.impact({ style: ImpactStyle.Light });
      return Haptics.notification({
        type: kind === "success" ? NotificationType.Success : NotificationType.Warning,
      });
    },
  );
}
