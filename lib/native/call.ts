import { hasCapability, type Capability } from "./capabilities";

export type NativeResult<T> =
  | { status: "ok"; value: T }
  | { status: "unavailable" }
  | { status: "failed"; error: unknown };

// An app older than the plugin method throws this.
function isUnimplemented(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "UNIMPLEMENTED";
}

/**
 * The one way the web code calls a plugin. It is "unavailable" in a browser, in an app built
 * without the plugin, and when the app lacks the method; anything else the plugin throws is
 * "failed". It never throws, so a caller only decides what each outcome means for its feature.
 * `load` imports the plugin module and `run` uses it: the plugin object itself is never awaited
 * or returned, because awaiting a plugin calls a `then` it doesn't have.
 */
export async function callNative<Module, Value>(
  capability: Capability,
  load: () => Promise<Module>,
  run: (module: Module) => Promise<Value>,
): Promise<NativeResult<Value>> {
  if (!hasCapability(capability)) return { status: "unavailable" };
  try {
    return { status: "ok", value: await run(await load()) };
  } catch (error) {
    return isUnimplemented(error) ? { status: "unavailable" } : { status: "failed", error };
  }
}
