# Migration guide — raghub → revex

This document is the canonical migration recipe for users coming
from the Python `raghub` 0.10.x series to the TypeScript
`revex` 1.1.x monorepo. The cutover is **hard** — there are no
backward-compat aliases.

## Overview

| Concern | raghub (Python) | revex (TypeScript) |
|---|---|---|
| Runtime | Python 3.12 + pip | Node.js 26 + pnpm |
| Workspaces | Single package | pnpm + Turbo monorepo |
| Domain model | Pydantic / `@dataclass(slots=True)` | Frozen value objects over `props` + branded IDs |
| HTTP | FastAPI | Hono on `@hono/node-server` |
| UI | Server-rendered Jinja + HTMX | Next.js 16 + shadcn/ui |
| Auth | bcrypt + PyJWT | bcrypt + `jose` |
| Encryption | Fernet (`REVEX_TENANT_SECRETS_KEY`) | scrypt + AES-256-GCM (passphrase-derived per workspace) |
| Vector store | sqlite-vec, pgvector | sqlite-vec + SQLite FTS5 |
| Storage | One SQLite per tenant | One SQLite per workspace |
| Tests | pytest, ruff, mypy, bandit, interrogate | Vitest, ESLint, tsc, Prettier |
| Publish | PyPI | npm (Trusted Publishing / OIDC) |

## Rename table

### Package names

| Old (raghub) | New (revex) |
|---|---|
| (monolithic) | `@revex/core` |
| (monolithic) | `@revex/orchestrator` |
| `raghub.api` | `@revex/api` |
| `raghub.cli` | `@revex/cli` |
| (none) | `@revex/eval` |
| (none) | `@revex/web` (private) |

### Cookies

| Old | New |
|---|---|
| `raghub_token` | `revex_session` |
| `raghub_passphrase` | `revex_workspace_key` |

### Headers

| Old | New |
|---|---|
| `x-raghub-path` | `x-revex-path` |
| `x-raghub-forwarded` | `x-revex-forwarded` |

### Environment variables

| Old prefix / name | New prefix / name |
|---|---|
| `RAG_*` | `REVEX_*` |
| `RAGHUB_*` | `REVEX_*` |
| `RAG_WORKSPACE_HOME` | `REVEX_WORKSPACE_HOME` |
| `RAG_API_PORT` | `REVEX_API_PORT` |
| `RAG_JWT_SECRET` | `REVEX_JWT_SECRET` |
| `RAG_LLM_API_KEY` | `REVEX_LLM_API_KEY` |
| `RAG_EMBEDDER_API_KEY` | `REVEX_EMBEDDER_API_KEY` |
| `RAG_TENANT_SECRETS_KEY` | `REVEX_TENANT_SECRETS_KEY` |
| `RAG_LLM_STUB` | `REVEX_LLM_STUB` |
| `RAG_PROFILE` | `REVEX_PROFILE` |
| `RAG_CORS_ORIGINS` | `REVEX_CORS_ORIGINS` |
| `RAG_RATE_LIMIT_*` | `REVEX_RATE_LIMIT_*` |

### Storage paths

| Old | New |
|---|---|
| `~/.raghub/` | `~/.revex/` |
| `${RAGHUB_HOME}/workspaces/<id>/workspace.db` | `${REVEX_WORKSPACE_HOME}/workspaces/<id>/workspace.db` |

### Error codes

| Old | New |
|---|---|
| `raghub_error` | `revex_error` |
| `RaghubError` (base class) | `RevexError` |

### Code identifiers

The TypeScript monorepo does not maintain compatibility aliases
for any of the Python identifiers. The relevant renames are:

| Old (raghub) | New (revex) |
|---|---|
| `raghub.services.ApplicationFacade` | `@revex/api` boot result |
| `raghub.RAG` facade | `@revex/api` `boot()` / `start()` |
| `raghub.config.Settings` | `@revex/core` `loadSettings()` |
| `raghub.stores.SqliteQueue` | `@revex/core` `SqliteJobQueue` |
| `raghub.feedback.{Feedback,Rating}` | `@revex/core` `Feedback`, `FeedbackRating` |
| `raghub.tenants.TenantContext` | (folded into the workspace context per request) |
| `raghub.retrieval.Hybrid` | `@revex/core` `hybridSearch` |
| `raghub.embedders.Hasher` | `@revex/core` `FeatureHashingEmbedder` |
| `raghub.llm.LiteLLM` | `@revex/core` `OpenAILlm` / `FeatureHashingLlm` / `StubLlm` |

## Migration recipe

1. **Install Node.js 26+** and **pnpm 9+**. The `.nvmrc` and
   `volta.node` block pin the exact versions used in CI.
2. **Clone and install**:

   ```bash
   git clone https://github.com/sachncs/revex.git
   cd revex
   pnpm install
   ```

3. **Rename every `@raghub/*` import** to the corresponding
   `@revex/*` package. There is no compatibility layer; old
   imports will fail.
4. **Replace cookies, headers, and env vars** with the new names
   per the rename tables above. The API will return 400-series
   errors if it sees the old names (the rename is not negotiated).
5. **Move workspaces** from `~/.raghub/` to `~/.revex/` (or point
   `REVEX_WORKSPACE_HOME` at the existing directory).
6. **Re-issue the JWT secret** with the new 32-character floor:

   ```bash
   openssl rand -base64 48
   # → REVEX_JWT_SECRET=<value>
   ```

7. **Generate a fresh tenant secrets key** if you previously used
   `REVEX_TENANT_SECRETS_KEY`; the AES-256-GCM parameters changed
   and old secrets will not unseal new rows.

   ```bash
   openssl rand -hex 32
   # → REVEX_TENANT_SECRETS_KEY=<value>
   ```

8. **Rotate LLM provider credentials** stored in
   `workspace_settings`. The 1.1.0 schema uses the same
   `provider` / `model` / `apiKey` / `baseUrl` fields, but
   values written by the Python series are not readable by the
   TypeScript code path and must be re-entered via the
   onboarding wizard or `PATCH /v1/settings/llm`.

## Removal of the Python tree

The Python source tree, the `archive/` directory, the archived
`fix.md`, the `docs/adr/` and `docs/architecture/decisions.md`
records, and the `todo/` tracking directory were removed from the
repository as part of the 1.1.0 cutover. If you need them for
archival purposes, check out the `0.10.0` tag before the removal
commit landed.

## FAQ

**Q: Can I keep my old raghub Python deployments and run revex in
parallel?**

A: Yes — they do not share state. Revex uses `~/.revex/` by
default; set `REVEX_WORKSPACE_HOME` to a different path if you
want to keep them apart.

**Q: Does revex support the Strands Agents SDK out of the box?**

A: The orchestrator is *Strands-shaped* — the agent registry,
tool registry, hook bus, and pattern builders mirror the Strands
SDK. The bundled in-process adapter is the supported runtime
today. To plug the real SDK in, install it (`pnpm add
strands-agents`) and pass it via `Orchestrator({ adapter })`.

**Q: What happened to the evaluation harness?**

A: It lives in `@revex/eval` (`packages/eval/`). The Finance and
Frames harnesses and the CARE judge are kept; the Python
entrypoints are gone.

**Q: I have an issue that isn't covered here.**

A: Open a discussion at
<https://github.com/sachncs/revex/discussions> or a private
security disclosure per `SECURITY.md`.
