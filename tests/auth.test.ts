import { describe, expect, it } from "vitest";
import { isAllowedUser } from "@/server/auth/config";

describe("auth allowlist", () => {
  it("allows the configured single-user email case-insensitively", () => {
    expect(isAllowedUser("F.OVERDEVEST@PERSONEEL.COM")).toBe(true);
  });

  it("rejects unknown users", () => {
    expect(isAllowedUser("someone@example.com")).toBe(false);
    expect(isAllowedUser(null)).toBe(false);
  });
});
