import { describe, expect, it } from "vitest";
import { z } from "zod";

const providerApprovalEvent = z.object({
  type: z.literal("APPROVAL_REQUESTED"),
  payload: z.object({
    approvalType: z.string(),
    title: z.string(),
    riskLevel: z.string(),
    targetResource: z.string().optional()
  })
});

describe("provider mapping", () => {
  it("validates approval-aware provider events before persistence", () => {
    const event = providerApprovalEvent.parse({
      type: "APPROVAL_REQUESTED",
      payload: {
        approvalType: "COMMAND_EXECUTION",
        title: "Run tests",
        riskLevel: "MEDIUM",
        targetResource: "npm test"
      }
    });

    expect(event.payload.approvalType).toBe("COMMAND_EXECUTION");
  });
});
