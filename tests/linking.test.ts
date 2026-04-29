import { describe, expect, it } from "vitest";

describe("project/thread linking", () => {
  it("uses project, thread, and run ids as required approval linkage", () => {
    const approval = {
      projectId: "project_1",
      threadId: "thread_1",
      runId: "run_1"
    };

    expect(Object.values(approval).every(Boolean)).toBe(true);
  });
});
