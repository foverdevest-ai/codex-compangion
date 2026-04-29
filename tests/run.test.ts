import { describe, expect, it } from "vitest";
import { assertRunTransition } from "@/domain/run";

describe("run transitions", () => {
  it("allows normal execution transitions", () => {
    expect(() => assertRunTransition("QUEUED", "RUNNING")).not.toThrow();
    expect(() => assertRunTransition("RUNNING", "WAITING_APPROVAL")).not.toThrow();
    expect(() => assertRunTransition("WAITING_APPROVAL", "RUNNING")).not.toThrow();
    expect(() => assertRunTransition("RUNNING", "COMPLETED")).not.toThrow();
  });

  it("prevents completed runs from mutating", () => {
    expect(() => assertRunTransition("COMPLETED", "RUNNING")).toThrow();
    expect(() => assertRunTransition("FAILED", "RUNNING")).toThrow();
  });
});
