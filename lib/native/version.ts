export type UpdateState = "ok" | "recommended" | "required";

export type UpdatePolicy = { recommended: string; required: string };

const NO_VERSION = "0.0.0";

export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

/** An app that reports no version is older than any version that does. */
export function updateState(version: string | null, policy: UpdatePolicy): UpdateState {
  const installed = version ?? NO_VERSION;
  if (compareVersions(installed, policy.required) < 0) return "required";
  if (compareVersions(installed, policy.recommended) < 0) return "recommended";
  return "ok";
}
