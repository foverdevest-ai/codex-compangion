import { describe, expect, it, vi } from "vitest";
import { CodexRunnerClient } from "@/server/runner/client";

describe("CodexRunnerClient", () => {
  it("stays disabled without real runner credentials", () => {
    const client = new CodexRunnerClient();
    expect(client.configured).toBe(false);
  });

  it("detects polling mode without exposing runner credentials", () => {
    vi.stubEnv("CODEX_RUNNER_MODE", "polling");

    const client = new CodexRunnerClient();

    expect(client.pollingMode).toBe(true);
    expect(client.configured).toBe(false);

    vi.unstubAllEnvs();
  });

  it("sends bearer-authenticated start run requests when configured", async () => {
    vi.stubEnv("CODEX_RUNNER_URL", "https://runner.example.test");
    vi.stubEnv("CODEX_RUNNER_TOKEN", "secret");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ providerRunId: "runner_1", status: "RUNNING" })
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new CodexRunnerClient();
    const response = await client.startRun({
      appRunId: "run_1",
      projectId: "project_1",
      threadId: "thread_1",
      prompt: "Build this"
    });

    expect(response?.providerRunId).toBe("runner_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://runner.example.test/runner/runs",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer secret" })
      })
    );

    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});
