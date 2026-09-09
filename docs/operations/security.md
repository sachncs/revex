# Security hardening

This page is the production hardening checklist. Every item is
also surfaced in `SECURITY.md` at the repo root; this page
adds the *why* and the recommended values.

## Secrets

| Item | Required | How |
|---|:---:|---|
| `REVEX_JWT_SECRET` is unique per deployment | ✓ | `openssl rand -base64 48`. Floor: 32 characters; the runtime refuses shorter secrets. |
| `REVEX_TENANT_SECRETS_KEY` is unique per deployment | ✓ | `openssl rand -hex 32`. Floor: 32 bytes (64 hex chars). |
| LLM provider API keys live only in `workspace_settings`, sealed by the workspace passphrase | ✓ | Use the onboarding wizard or `PATCH /v1/settings/llm`; never set them via `process.env` in production. |
| No `.env` file is committed | ✓ | `.env*` is in `.gitignore`. |

## HTTP surface

| Item | Required | How |
|---|:---:|---|
| `REVEX_CORS_ORIGINS` is the real frontend origin | ✓ | e.g. `https://app.example.com`. No wildcard. |
| `REVEX_PROFILE=production` | ✓ | Enables HSTS, refuses wildcard CORS, makes `REVEX_JWT_SECRET` mandatory. |
| `REVEX_CSP` is set | ✓ | A reasonable default: `default-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'`. |
| `REVEX_TRUSTED_PROXY_CIDRS` is set when behind a proxy | ✓ | e.g. `10.0.0.0/8`. Without it the rate limiter ignores `X-Forwarded-For`. |
| HSTS preload list submission | recommended | After 30 days of clean HSTS, submit to <https://hstspreload.org>. |

## Cookies and CSRF

| Item | Required | How |
|---|:---:|---|
| `revex_session` and `revex_workspace_key` are `HttpOnly` + `Secure` + `SameSite=Lax` | ✓ | Issued by the API via `Set-Cookie`; never written from `document.cookie`. |
| State-changing routes (`POST` / `PATCH` / `PUT` / `DELETE`) reject mismatched `Origin` | ✓ | `csrfMiddleware` returns `403 csrf_rejected`. |
| The web app forwards the browser `Origin` header | ✓ | Done by `apps/web/src/app/api/proxy/route.ts`. |

## Authentication

| Item | Required | How |
|---|:---:|---|
| JWT algorithm is `HS256`, `HS384`, or `HS512` — never `none` | ✓ | Set explicitly via `REVEX_JWT_ALGORITHM`. |
| The workspace passphrase is at least 8 characters | ✓ | Enforced by the auth routes. |
| Every workspace uses a non-default passphrase | ✓ | Reject `REVEX_ALLOW_DEV_PASSPHRASE` in production. |
| Token TTL is short (≤ 24 h) | recommended | `REVEX_TOKEN_TTL_SECONDS=86400`. |

## Rate limiting and abuse

| Item | Required | How |
|---|:---:|---|
| Per-IP requests are capped at 60/min | ✓ | `REVEX_RATE_LIMIT_PER_IP`. |
| Per-workspace requests are capped at 600/min | ✓ | `REVEX_RATE_LIMIT_PER_WORKSPACE`. |
| The middleware verifies the JWT signature before reading the `workspace_id` claim | ✓ | Implemented in `packages/api/src/middleware/rate-limit.ts`. |
| The middleware ignores `X-Forwarded-For` unless the peer is in `REVEX_TRUSTED_PROXY_CIDRS` | ✓ | Same module. |

## Random identifiers

| Item | Required | How |
|---|:---:|---|
| All workspace, user, job, group, webhook, and feedback IDs come from `newId(prefix)` (128-bit `crypto.randomUUID()`) | ✓ | The runtime refuses to mint an ID if `crypto.randomUUID` is unavailable. No `Math.random()` for security-relevant IDs. |

## Telemetry and audit

| Item | Required | How |
|---|:---:|---|
| Production telemetry is `langfuse` or `otel` | ✓ | `REVEX_TELEMETRY_PROVIDER`. The default `noop` discards everything. |
| The audit log table (`audit_event`) is append-only | ✓ | The audit store has no public `update` / `delete`; rotate a backup before any maintenance. |
| Production publishes via Trusted Publishing (OIDC) | ✓ | `.github/workflows/release.yml` uses `id-token: write`; no long-lived npm token. |

## Supply chain

| Item | Required | How |
|---|:---:|---|
| CI installs third-party tooling from pinned, checksummed artifacts | ✓ | The web-e2e `curl ... | sh` step was removed (see #44). |
| `pnpm install --frozen-lockfile` is the install entry point | ✓ | Drift between `pnpm-lock.yaml` and `package.json` is a build failure. |
| Renovate or Dependabot is enabled | recommended | Pin `@revex/*` minor versions; review major bumps manually. |

## Container image

A minimal Dockerfile is in `docker/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:26-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages packages
COPY apps apps
COPY docs docs
COPY mkdocs.yml ./
COPY tsconfig.base.json turbo.json ./
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build
ENV REVEX_PROFILE=production
EXPOSE 3000
CMD ["node", "--enable-source-maps", "packages/api/dist/index.js"]
```

Operational notes:

- Run as a non-root user (`USER 1001`).
- Mount `${REVEX_WORKSPACE_HOME}` from a high-IOPS volume.
- Pass secrets via `ENV` or a secrets-mounted file. Never bake
  them into the image.
- Set `read_only: true` and `tmpfs: ['/tmp']` if your runtime
  supports it.

## Verification

After every change to the security surface, run:

```bash
pnpm test                                                # all unit + integration tests
pnpm --filter @revex/api test -- --run test/middleware   # middleware suites (rate-limit, csrf, cidr, cookies)
pnpm --filter @revex/core test -- --run test/ids         # ID-entropy test
```

A green run indicates the production hardening surface is
intact.

## What's next

- [Deployment](deployment.md) — process manager, sizing,
  upgrades.
- [Configuration](../configuration.md) — every env var.
- [Troubleshooting](../troubleshooting.md) — common failure modes.
