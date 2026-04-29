import { describe, expect, it } from "vitest";

type InboxItem = { type: "approval" | "run" | "notice"; status?: string; readAt?: Date | null };

function unreadPendingCount(items: InboxItem[]) {
  return items.filter((item) => item.type === "approval" && item.status === "PENDING").length +
    items.filter((item) => item.type !== "approval" && !item.readAt).length;
}

describe("inbox pending logic", () => {
  it("prioritizes pending approvals and unread notices", () => {
    expect(unreadPendingCount([
      { type: "approval", status: "PENDING" },
      { type: "approval", status: "APPROVED" },
      { type: "notice", readAt: null },
      { type: "run", readAt: new Date() }
    ])).toBe(2);
  });
});
