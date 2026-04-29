import { describe, expect, it } from "vitest";
import { assertApprovalTransition, resolveRunStatusAfterApproval } from "@/domain/approval";

describe("approval transitions", () => {
  it("allows pending approvals to be approved or rejected", () => {
    expect(() => assertApprovalTransition("PENDING", "APPROVED")).not.toThrow();
    expect(() => assertApprovalTransition("PENDING", "REJECTED")).not.toThrow();
  });

  it("prevents terminal approval decisions from changing", () => {
    expect(() => assertApprovalTransition("APPROVED", "REJECTED")).toThrow();
    expect(() => assertApprovalTransition("REJECTED", "APPROVED")).toThrow();
  });

  it("keeps a run waiting while unresolved approvals remain", () => {
    expect(resolveRunStatusAfterApproval(true)).toBe("WAITING_APPROVAL");
    expect(resolveRunStatusAfterApproval(false)).toBe("RUNNING");
  });
});
