# Configuration

Revex reads every setting from environment variables. The
canonical loader is `loadSettings()` in
`@revex/core/src/settings/index.ts`; the API additionally reads
operational env vars (port, CORS, trusted proxies) directly from
`process.env` at boot.

## Precedence

Settings are applied in this order (later wins):

1. Built-in defaults — see each variable below.
2. `REVEX_*` environment variables.
3. Per-workspace overrides stored in the `workspace_settings`
   table (encrypted with the workspace passphrase).

The web console and CLI never write to `process.env`. To change
a per-workspace setting at runtime, use
`PATCH /v1/settings/llm` or `PATCH /v1/settings/reranker`.

## Auth and encryption

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_JWT_SECRET` | dev fallback (37 chars) | HS256 signing secret. **Required** when `REVEX_PROFILE=production`. Floor: 32 characters. Generate with `openssl rand -base64 48`. |
| `REVEX_TENANT_SECRETS_KEY` | — | 32-byte hex key used to seal `workspace_settings`. Generate with `openssl rand -hex 32`. |
| `REVEX_JWT_ALGORITHM` | `HS256` | `HS256` / `HS384` / `HS512`. |
| `REVEX_TOKEN_TTL_SECONDS` | `86400` | JWT lifetime in seconds. |

## Workspace storage

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_WORKSPACE_HOME` | `~/.revex` | Root for workspace data, registry.db, and files. |
| `REVEX_WORKSPACE_DIR` | — | Direct parent of `workspace.db` files. Overrides the home-derived path. |
| `REVEX_PASSPHRASE_VAULT` | `memory` | `memory` (dev) or `kms` (prod). |

## HTTP server

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_API_PORT` | `3000` | HTTP listen port. |
| `REVEX_VERSION` | `0.1.0` | Version surfaced in `/health`. |
| `REVEX_PROFILE` | `development` | `development` / `production`. Enables HSTS and refuses wildcard CORS when `production`. |
| `REVEX_CORS_ORIGINS` | — | Comma-separated allowlist of frontend origins. Default: `http://localhost:3001,http://127.0.0.1:3001`. |
| `REVEX_CSP` | — | `Content-Security-Policy` header value. |
| `REVEX_TRUSTED_PROXY_CIDRS` | — | Comma-separated list of CIDRs. The rate limiter honors `X-Forwarded-For` only when the socket peer matches one. |
| `REVEX_RESET_STUCK_JOBS` | — | Set to `1` to requeue any `running` jobs on boot. |
| `REVEX_WORKER_ROLE` | `leader` | `leader` / `follower` / `disabled`. Multi-replica deployments set exactly one replica to `leader`. |

## Embeddings

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_EMBEDDER_PROVIDER` | `openai` | `openai` / `feature_hashing`. |
| `REVEX_EMBEDDER_MODEL` | `text-embedding-3-large` | Embedding model. |
| `REVEX_EMBEDDER_API_KEY` | — | Use `OpenAIEmbedder`. Falls back to `OPENAI_API_KEY`. |
| `REVEX_VECTOR_EMBEDDING_DIM` | `3072` | Vector dimension. |
| `REVEX_VECTOR_BACKEND` | `sqlite_vec` | Currently the only backend. |

## LLM

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_LLM_PROVIDER` | `openai` | `openai` / `anthropic` / `bedrock` / `litellm` / `stub`. |
| `REVEX_LLM_MODEL` | `gpt-4.1` | LLM model. |
| `REVEX_LLM_API_KEY` | — | Provider key. Encrypted with the workspace passphrase before persistence. |
| `REVEX_LLM_BASE_URL` | — | Custom base URL for OpenAI-compatible providers. |
| `REVEX_LLM_STUB` | — | Set to `1` to force `StubLlm` (deterministic, offline, used by tests and the smoke run). |
| `REVEX_LLM_TEMPERATURE` | `0` | Default sampling temperature. |

## Hybrid retrieval

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_HYBRID_DENSE_WEIGHT` | `0.6` | Dense (vector) weight in the linear-fusion blend. |
| `REVEX_HYBRID_SPARSE_WEIGHT` | `0.4` | Sparse (BM25) weight in the linear-fusion blend. |
| `REVEX_HYBRID_RRF_K` | `60` | Reciprocal Rank Fusion constant. |
| `REVEX_HYBRID_COLBERT` | `false` | Enable late-interaction (ColBERT) re-ranking. |

## Orchestrator

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_ORCHESTRATOR_MODE` | `graph` | `graph` / `swarm` / `workflow`. |
| `REVEX_ORCHESTRATOR_ORDERING` | `standard` | `standard` / `priority` / `fifo`. |
| `REVEX_ORCHESTRATOR_TOP_K` | `10` | Top-K candidates passed to the reranker. |
| `REVEX_ORCHESTRATOR_RERANKER` | `identity` | `identity` / `bge` / `cohere` / `llm_judge`. |

## Telemetry

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_TELEMETRY_PROVIDER` | `noop` | `noop` / `langfuse` / `otel`. |
| `REVEX_LANGFUSE_PUBLIC_KEY` | — | Langfuse public key. |
| `REVEX_LANGFUSE_SECRET_KEY` | — | Langfuse secret key. |
| `REVEX_OTEL_ENDPOINT` | — | OpenTelemetry OTLP endpoint. |

## Rate limiting

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_RATE_LIMIT_PER_IP` | `60` | Per-IP requests per minute. |
| `REVEX_RATE_LIMIT_PER_WORKSPACE` | `600` | Per-workspace requests per minute. |

## Debugging

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_DEBUG_POOL` | — | Set to `1` to log every `WorkspacePool.get` lookup. |
| `REVEX_DEBUG_DOCS` | — | Set to `1` to log every `GET /v1/documents` response. |
| `REVEX_AGENT_HOOK_LOGS` | — | Set to `1` to log agent breadcrumb events. |

## Web → API base URL

| Variable | Default | Meaning |
|---|---|---|
| `REVEX_API_BASE` | `http://localhost:3000` | The web console proxies `/api/*` to this base. |
| `NEXT_PUBLIC_SITE_URL` | `https://sachncs.github.io/revex/` | Used by the web metadata for OG / Twitter image URLs. |

## Profile: `development` vs `production`

`REVEX_PROFILE=production` flips the following:

- **HSTS** — `Strict-Transport-Security: max-age=63072000;
  includeSubDomains; preload` is added to every response.
- **Secure cookies** — `revex_session` and `revex_workspace_key`
  are issued with the `Secure` flag.
- **Wildcard CORS** — `REVEX_CORS_ORIGINS=*` is rejected at
  boot.
- **JWT secret** — `REVEX_JWT_SECRET` becomes mandatory; the
  dev fallback (`dev-secret-change-me-please-32-bytes-min`) is
  no longer accepted.

Use `REVEX_PROFILE=production` for any deployment that is not a
local dev machine. See [Security hardening](operations/security.md)
for the full checklist.

## Examples

`.env` for a local development install:

```bash
REVEX_JWT_SECRET=$(openssl rand -base64 48)
REVEX_TENANT_SECRETS_KEY=$(openssl rand -hex 32)
REVEX_EMBEDDER_API_KEY=sk-...
REVEX_LLM_PROVIDER=openai
REVEX_LLM_MODEL=gpt-4.1
REVEX_LLM_API_KEY=sk-...
REVEX_TELEMETRY_PROVIDER=noop
```

`.env` for a production deployment behind nginx:

```bash
REVEX_PROFILE=production
REVEX_JWT_SECRET=<48 base64 chars>
REVEX_TENANT_SECRETS_KEY=<64 hex chars>
REVEX_WORKSPACE_HOME=/var/lib/revex
REVEX_API_PORT=3000
REVEX_CORS_ORIGINS=https://app.example.com
REVEX_CSP=default-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'
REVEX_TRUSTED_PROXY_CIDRS=10.0.0.0/8
REVEX_LLM_PROVIDER=openai
REVEX_LLM_MODEL=gpt-4.1
REVEX_LLM_API_KEY=sk-...
REVEX_TELEMETRY_PROVIDER=langfuse
REVEX_LANGFUSE_PUBLIC_KEY=pk-...
REVEX_LANGFUSE_SECRET_KEY=sk-...
REVEX_WORKER_ROLE=leader
```

## Validation

`loadSettings()` rejects malformed env vars at boot with a
`ConfigurationError` — the server fails fast rather than
silently picking up a wrong default. The most common
validation failures are:

| Symptom | Cause | Fix |
|---|---|---|
| `REVEX_JWT_SECRET must be at least 32 characters` | Secret is too short. | `openssl rand -base64 48` |
| `REVEX_TENANT_SECRETS_KEY must be 32 bytes` (hex) | Key is the wrong length or non-hex. | `openssl rand -hex 32` |
| `wildcard CORS is not allowed in production` | `REVEX_CORS_ORIGINS=*` with `REVEX_PROFILE=production`. | Replace `*` with the real origin(s). |
| `REVEX_TRUSTED_PROXY_CIDRS: invalid CIDR '<x>'` | Malformed CIDR in the trust list. | Use `<ipv4>/<bits>` or `<ipv6>/<bits>`. |
