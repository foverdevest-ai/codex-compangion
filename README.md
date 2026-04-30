# Codex Companion

Codex Companion is an approval-first prompt cockpit for a single power user working on long-lived coding projects from desktop or mobile.

It is built as a production-minded Next.js App Router application with Prisma/PostgreSQL, TypeScript, Tailwind CSS, shadcn-style primitives, provider abstractions, server-sent event scaffolding, seeded demo data, and focused tests for approval and run logic.

## Core Capabilities

- Projects with saved context, architecture notes, templates, threads, runs, and artifacts.
- Thread detail with message timeline, sticky mobile composer, run stream, and inline approval banners.
- First-class approval inbox with risk, target resource, reason, audit history, approve, and reject actions.
- Unified inbox for pending approvals, failed runs, notices, and sync issues.
- Runs, templates, artifacts, and settings screens.
- Approval-aware backend provider contract plus `CodexAppServerProvider` scaffold.
- PWA manifest, mobile bottom navigation, safe-area handling, and installable-app foundations.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- TanStack Query dependency included for client data flows
- Server-sent events for run-event streaming scaffolding
- Vitest

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure the database:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL database.

3. Generate Prisma and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Mobile Cloud Setup

For real 4G/mobile usage, deploy the app to Vercel with Neon Postgres and Google login. Codex execution should run in a separate cloud runner; the phone only sends prompts, watches runs, and approves/rejects actions.

See [docs/deployment/mobile-cloud.md](docs/deployment/mobile-cloud.md).

## Codex Desktop Sync And Runner

Codex Companion can mirror local Codex Desktop workspaces into the production database and queue prompts for a local runner.

Sync local Codex projects/threads into the configured database:

```bash
npm run codex:sync-local
```

Run the local Codex runner. This polls Postgres for queued runs, executes `codex exec` in the project's `codex.workspace_dir`, and writes output back to the thread:

```bash
set CODEX_RUNNER_MODE=polling
npm run codex:runner
```

In production, set `CODEX_RUNNER_MODE=polling` on Vercel. The Vercel app writes queued runs to Neon; the runner only needs outbound database access, so it works from a laptop, VPS, or container without exposing an inbound webhook.

Production uses:

```bash
npm run db:deploy
```

Use `npm run db:seed` only for local/demo data.

## Architecture

- `app/` contains routes and API endpoints.
- `components/` contains shared UI and layout.
- `features/` contains product-specific UI modules.
- `domain/` contains pure approval and run transition logic.
- `server/` contains repositories and services.
- `providers/` contains coding backend provider contracts and adapter scaffolds.
- `prisma/` contains schema and seed data.
- `docs/design-system.md` defines the product design system.
- `tests/` covers approval transitions, run transitions, provider mapping, inbox logic, and linking invariants.

## Approval Model

Approvals are first-class domain objects with explicit states:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `EXPIRED`
- `CANCELLED`

Each approval is linked to project, thread, and run, and stores risk, target resource, reason, payload, timestamps, and decision history.

## Notes

This is V1 for one user. The schema keeps clear ownership boundaries so authentication and multi-user collaboration can be introduced later without changing the core approval/run model.
