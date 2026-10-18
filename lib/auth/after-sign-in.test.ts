import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));

import { finishSignIn } from "./after-sign-in";

function supabaseWithReferral(error: { message: string } | null) {
  return { rpc: vi.fn().mockResolvedValue({ error }) } as never;
}

const BASE = { userId: "user-1", method: "apple", next: "/app/library" } as const;

describe("finishSignIn", () => {
  it("goes to next when there is no referral code", async () => {
    expect(await finishSignIn({ ...BASE, supabase: supabaseWithReferral(null), ref: "" })).toBe(
      "/app/library",
    );
  });

  it("goes to next when the referral code is redeemed", async () => {
    expect(await finishSignIn({ ...BASE, supabase: supabaseWithReferral(null), ref: "ABC" })).toBe(
      "/app/library",
    );
  });

  it("returns to sign-up completion when the referral code is rejected", async () => {
    const destination = await finishSignIn({
      ...BASE,
      supabase: supabaseWithReferral({ message: "invalid" }),
      ref: "ABC",
    });
    expect(destination).toBe("/complete-signup?ref=ABC&error=invalid-code&next=%2Fapp%2Flibrary");
  });
});
