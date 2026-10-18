import { describe, expect, it } from "vitest";
import { appleSignInError, readAppleSignInInput } from "./apple-sign-in";

const VALID = { idToken: "token", nonce: "nonce" };

describe("readAppleSignInInput", () => {
  it.each([null, "token", 42, {}, { idToken: "token" }, { nonce: "nonce" }])(
    "rejects %j",
    (body) => {
      expect(readAppleSignInInput(body)).toBeNull();
    },
  );

  it("rejects an oversized token", () => {
    expect(readAppleSignInInput({ ...VALID, idToken: "a".repeat(8193) })).toBeNull();
  });

  it("sends a hostile next path to the sign-up completion page", () => {
    expect(readAppleSignInInput({ ...VALID, next: "//evil.com" })?.next).toBe("/complete-signup");
  });

  it("keeps a safe next path", () => {
    expect(readAppleSignInInput({ ...VALID, next: "/app/library" })?.next).toBe("/app/library");
  });

  it("normalizes the referral code", () => {
    expect(readAppleSignInInput({ ...VALID, ref: " abc " })?.ref).toBe("ABC");
  });
});

describe("appleSignInError", () => {
  it("reports a banned account as suspended", () => {
    expect(appleSignInError("user_banned")).toBe("suspended");
  });

  it("reports anything else as a failed sign-in", () => {
    expect(appleSignInError("bad_jwt")).toBe("oauth-failed");
    expect(appleSignInError(undefined)).toBe("oauth-failed");
  });
});
