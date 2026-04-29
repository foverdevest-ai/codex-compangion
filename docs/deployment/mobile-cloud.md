# Mobile Cloud Deployment

Codex Companion is designed so the phone is only the cockpit. The real Codex execution happens on a cloud runner.

## Vercel + Neon

1. Create a Neon Postgres database.
2. Set Vercel environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ALLOWED_USER_EMAILS=f.overdevest@personeel.com`
   - `CODEX_RUNNER_URL`
   - `CODEX_RUNNER_TOKEN`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` when push delivery is configured
3. Deploy from GitHub to Vercel.
4. Run production migrations with `npm run db:deploy`.

Do not run the demo seed command against production unless you intentionally want demo data.

## Google Login

Create a Google OAuth client with:

- Authorized JavaScript origin: your Vercel/custom domain.
- Authorized redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`.

Only emails in `ALLOWED_USER_EMAILS` can access the app.

## Codex Runner Contract

The runner receives server-to-server bearer-authenticated requests. The bearer token is `CODEX_RUNNER_TOKEN` and is never sent to the browser.

Required endpoints:

- `POST /runner/runs`
- `GET /runner/runs/:providerRunId/events`
- `POST /runner/approvals/:approvalRequestId/decision`

`POST /runner/runs` request:

```json
{
  "appRunId": "run_id_from_companion",
  "projectId": "project_id",
  "threadId": "thread_id",
  "prompt": "user prompt"
}
```

Response:

```json
{
  "providerRunId": "runner_run_id",
  "status": "RUNNING"
}
```

Runner event response:

```json
[
  {
    "type": "OUTPUT_DELTA",
    "content": "streamed text",
    "payload": {}
  }
]
```

Approval decision request:

```json
{
  "providerRunId": "runner_run_id",
  "approvalRequestId": "approval_id",
  "status": "APPROVED",
  "note": "optional audit note"
}
```

## Runner Responsibilities

- Hold Codex CLI/API credentials server-side.
- Keep MCP/plugin configuration server-side.
- Check out target project repositories.
- Start Codex runs from app prompts.
- Emit run events and approval requests back to Companion.
- Pause execution until approval decisions arrive.
