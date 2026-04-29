import { runnerRunEventSchema, runnerStartRunResponseSchema, type RunnerRunEvent } from "./schemas";

export type RunnerStartRunInput = {
  appRunId: string;
  projectId: string;
  threadId: string;
  prompt: string;
};

export type RunnerDecisionInput = {
  providerRunId?: string | null;
  approvalRequestId: string;
  status: "APPROVED" | "REJECTED";
  note?: string;
};

export class CodexRunnerClient {
  private readonly baseUrl = process.env.CODEX_RUNNER_URL ?? process.env.CODEX_APP_SERVER_URL;
  private readonly token = process.env.CODEX_RUNNER_TOKEN ?? process.env.CODEX_APP_SERVER_TOKEN;

  get configured() {
    return Boolean(
      this.baseUrl &&
      this.token &&
      !this.baseUrl.includes("example.internal") &&
      !["replace-me", "local-dev"].includes(this.token)
    );
  }

  async startRun(input: RunnerStartRunInput) {
    if (!this.configured) return null;
    const response = await this.fetchJson("/runner/runs", {
      method: "POST",
      body: JSON.stringify(input)
    });
    return runnerStartRunResponseSchema.parse(response);
  }

  async sendApprovalDecision(input: RunnerDecisionInput) {
    if (!this.configured) return null;
    return this.fetchJson(`/runner/approvals/${input.approvalRequestId}/decision`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async listRunEvents(providerRunId: string): Promise<RunnerRunEvent[]> {
    if (!this.configured) return [];
    const response = await this.fetchJson(`/runner/runs/${providerRunId}/events`, { method: "GET" });
    const rawEvents = Array.isArray(response) ? response : [];
    return rawEvents.map((event) => runnerRunEventSchema.parse(event));
  }

  private async fetchJson(path: string, init: RequestInit) {
    const url = new URL(path, this.baseUrl).toString();
    const response = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`,
        ...init.headers
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Runner request failed ${response.status}: ${body.slice(0, 300)}`);
    }
    return response.json();
  }
}
