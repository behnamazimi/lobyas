import { isNativeShell } from "@/lib/native/shell";

export type HapticKind = "tap" | "success" | "warning";

/** Native app only. An installed app older than the plugin throws, and that is ignored. */
export function buzz(kind: HapticKind) {
  if (!isNativeShell()) return;
  void import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle, NotificationType }) => {
      if (kind === "tap") return Haptics.impact({ style: ImpactStyle.Light });
      return Haptics.notification({
        type: kind === "success" ? NotificationType.Success : NotificationType.Warning,
      });
    })
    .catch(() => {});
}
