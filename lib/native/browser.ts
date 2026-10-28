import { callNative } from "./call";

const loadPlugin = () => import("@capacitor/browser");

/** Opens a page in the system browser, over the app. False when it couldn't be opened. */
export async function openSystemBrowser(url: string): Promise<boolean> {
  const result = await callNative("browser", loadPlugin, ({ Browser }) => Browser.open({ url }));
  return result.status === "ok";
}

/** Closes the system browser if it is open. */
export function closeSystemBrowser() {
  void callNative("browser", loadPlugin, ({ Browser }) => Browser.close());
}
