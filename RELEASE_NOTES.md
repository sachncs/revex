# Release notes — Revex 1.1.0

Revex 1.1.0 is the first tag of the TypeScript monorepo. It ships
hybrid retrieval (dense vectors + BM25 + graph + memory + web),
per-workspace RBAC, encrypted SQLite workspaces, the Strands-shaped
orchestrator with the in-process adapter, the Hono HTTP API, the
Next.js 16 console, and the `revex` CLI.

This release notes file complements `CHANGELOG.md` (which keeps a
detailed, machine-readable history) with a curated narrative of
what's in 1.1.0.

## Highlights

- **Hybrid retrieval** — `sqlite-vec` dense search fused with
  SQLite FTS5 BM25 via Reciprocal Rank Fusion (`k=60`).
- **Encrypted workspaces** — every workspace is one SQLite file
  whose `workspace_settings` rows are sealed with AES-256-GCM
  keyed by scrypt (N=2¹⁵, r=8, p=1).
- **Per-user RBAC** — workspace member roles plus document-level
  ACLs, enforced inside the storage layer.
- **Strands-shaped orchestrator** — a single `Orchestrator`
  façade with `Graph`, `Swarm`, and `Workflow` pattern builders,
  fronting an in-process agent registry. The real Strands Agents
  SDK is an optional peer dependency; the in-process adapter is
  the supported runtime path (see *Strands Agents* below).
- **Async ingestion** — `POST /v1/documents` returns
  `202 {status: 'pending'}`; a `JobWorker` per workspace drains
  the queue, runs `ingest()`, and flips rows to `ready` or
  `failed`.
- **SSE streaming** — `/v1/query/stream` streams tokens via
  Server-Sent Events through a Next.js proxy.
- **Web console** — Next.js 16 + shadcn/ui, light theme for the
  marketing surface, dark theme for the app shell.
- **Telemetry** — `NoOpTelemetry` (default), `LangfuseTelemetry`,
  `OtelTelemetry`.
- **CLI** — `revex init | server | ingest | query | feedback |
  eval | queue | tenant | backup | docs | naming` (11 subcommands).

## What's new since 0.10.0

Revex 0.10.0 was the last tag of the Python raghub series. 1.1.0
is the first TypeScript release. Highlights of the cutover:

- **Language + runtime**: Python → TypeScript 5.6+ on Node.js 26.
- **Workspaces**: monorepo via pnpm + Turbo.
- **Storage**: Pydantic models → frozen value objects over an
  internal `props` bag with branded IDs.
- **HTTP**: FastAPI → Hono, served by `@hono/node-server`.
- **Auth**: bcrypt + JWT (jose) + scrypt/AES-256-GCM.
- **UI**: Next.js 16 + shadcn/ui (`new-york` preset, OKLCH palette).
- **Vector store**: sqlite-vec + SQLite FTS5.
- **Tests**: Vitest + fast-check, one concept per test file,
  coverage ≥ 80% per package.

See `MIGRATION.md` for the rename and env-var map from the Python
raghub series to the current TypeScript monorepo.

## Strands Agents

The orchestrator's surface is *Strands-shaped* — its agent
registry, tool registry, hook bus, and three pattern builders
(`buildGraph` / `buildSwarm` / `buildWorkflow`) mirror the Strands
Agents SDK so the runtime can swap in the real SDK later without
touching callers. `strands-agents` is declared as an *optional*
peer dependency in `@revex/orchestrator`; the bundled in-process
adapter is the supported runtime today.

If you want to plug the real Strands Agents SDK in, install it
(`pnpm add strands-agents`) and pass it via the
`Orchestrator({ adapter })` constructor option.

## Breaking changes from 0.10.0

This is a hard cutover. There are no compatibility aliases; old
package names, env vars, cookies, and headers do not exist. See
`MIGRATION.md` for the full mapping and the steps required to
move an existing workspace to the new layout.

## Quality gates

The CI pipeline (`.github/workflows/ci.yml`) runs on every push
and pull request to `master`:

- `pnpm install --frozen-lockfile`
- `pnpm turbo run lint`
- `pnpm turbo run typecheck`
- `pnpm turbo run test`
- `pnpm turbo run build`

## Supported environments

| Component | Version |
|---|---|
| Node.js | 26.0+ |
| pnpm | 9.0+ |
| TypeScript | 5.6+ |
| Next.js | 16.3+ |
| Hono | 4.x |

## Acknowledgements

Revex stands on the shoulders of: [sqlite-vec], [Hono], [Next.js],
[shadcn/ui], [jose], [bcrypt], [OpenAI], and the [Strands Agents]
design notes. Thanks to everyone who has filed issues, opened pull
requests, and run the eval suite.

[sqlite-vec]: https://github.com/asg017/sqlite-vec
[Hono]: https://hono.dev
[Next.js]: https://nextjs.org
[shadcn/ui]: https://ui.shadcn.com
[jose]: https://github.com/panva/jose
[bcrypt]: https://github.com/kelektiv/node.bcrypt.js
[OpenAI]: https://github.com/openai/openai-node
[Strands Agents]: https://strandsagents.com
