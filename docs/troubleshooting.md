# Troubleshooting

Common failure modes and how to fix them.

## Install

### `pnpm install` fails on `better-sqlite3`

**Symptom**: the install step exits with `node-gyp` errors or
`Could not find any Python installation`.

**Fix**: rebuild the native modules.

```bash
pnpm rebuild -r better-sqlite3 @sqlite.org/sqlite-vec
```

The rebuild requires a C++ toolchain (Xcode CLT on macOS,
`build-essential` on Debian/Ubuntu, MSVC on Windows). On
Debian/Ubuntu:

```bash
sudo apt-get install -y build-essential python3
```

### `corepack` does not find `pnpm`

**Symptom**: `pnpm: command not found` after `corepack enable`.

**Fix**: pin the version explicitly.

```bash
corepack prepare pnpm@9.12.3 --activate
```

The `packageManager` field in `package.json` is the source of
truth; corepack reads it on every invocation.

## Boot

### Server fails fast: `REVEX_JWT_SECRET must be at least 32 characters`

**Cause**: the secret is too short. The runtime refuses to start
with a sub-32-character secret when `REVEX_PROFILE=production`.

**Fix**: regenerate.

```bash
openssl rand -base64 48
# Paste into REVEX_JWT_SECRET
```

### `wildcard CORS is not allowed in production`

**Cause**: `REVEX_CORS_ORIGINS=*` and `REVEX_PROFILE=production`.

**Fix**: replace the wildcard with the real origin(s).

```bash
REVEX_CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

### `invalid CIDR '<x>'`

**Cause**: `REVEX_TRUSTED_PROXY_CIDRS` or another CIDR env var
contains a malformed entry.

**Fix**: the parser expects `<ipv4>/<bits>` or `<ipv6>/<bits>`.

```bash
REVEX_TRUSTED_PROXY_CIDRS=10.0.0.0/8,192.168.0.0/16
```

## Runtime

### `/v1/query/stream` hangs after the first token

**Symptom**: the chat UI receives the first SSE event, then
nothing.

**Cause**: the reverse proxy is buffering the response.

**Fix**: disable buffering on the `/v1/query/stream` location.

```nginx
location /v1/query/stream {
    proxy_pass http://revex_api;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
}
```

### `429 rate_limit` for legitimate traffic

**Symptom**: the API returns 429 even though the volume is
reasonable.

**Cause**: the per-IP or per-workspace bucket is exhausted. The
default is 60 req/min/IP and 600 req/min/workspace.

**Fix**: tune the limits, or fix a runaway client.

```bash
REVEX_RATE_LIMIT_PER_IP=300
REVEX_RATE_LIMIT_PER_WORKSPACE=3000
```

### `403 csrf_rejected` on same-origin POST

**Symptom**: a same-origin POST is rejected with
`csrf_rejected`.

**Cause**: the browser is not sending the `Origin` header, or
the middleware is configured without the origin in the
allowlist.

**Fix**: confirm the browser sends `Origin`. Confirm
`REVEX_CORS_ORIGINS` includes the origin the browser reports.

```bash
REVEX_CORS_ORIGINS=https://app.example.com
```

### `401 auth_error` after a successful login

**Symptom**: the user signs in successfully but every
authenticated request returns `401`.

**Cause**: the API is not seeing the `revex_session` cookie or
the `Authorization` header on the second request. Most often this
is a misconfigured reverse proxy that strips cookies or
authorization headers.

**Fix**: confirm the proxy forwards both `Cookie` and
`Authorization` headers; confirm the cookie attributes
(`Secure`, `SameSite`) match the deployment (HTTPS or HTTP).

## Ingestion

### Documents stuck in `pending`

**Symptom**: `GET /v1/documents` returns rows whose
`status` is `pending` or `indexing` for minutes.

**Cause**: the per-workspace worker is not draining the queue.
The supervisor polls every `pollMs` (default 2 s). If
`REVEX_WORKER_ROLE=follower`, the supervisor is disabled on
this replica — only the `leader` replica drains.

**Fix**: ensure exactly one replica has
`REVEX_WORKER_ROLE=leader`. Check the API logs:

```bash
revex-api: worker role=leader; supervisor started
```

### Native module rebuild fails on M-series macOS

**Symptom**: `pnpm rebuild -r better-sqlite3` fails with
`mach-o, but wrong architecture`.

**Fix**: ensure Xcode CLT is installed and the native module
matches the host architecture.

```bash
xcode-select --install
pnpm rebuild -r better-sqlite3 @sqlite.org/sqlite-vec
```

## Web console

### The chat composer shows "loading" forever

**Symptom**: the chat composer mounts, but no answer streams in.

**Cause**: the proxy at `apps/web/src/app/api/proxy/route.ts`
cannot reach the API. The default is
`http://localhost:3000`; if the API is on a different host or
port, set `REVEX_API_BASE`.

**Fix**:

```bash
REVEX_API_BASE=http://localhost:3000
```

Restart the web dev server after changing the env var.

### Cookies are missing in DevTools

**Symptom**: the `revex_session` / `revex_workspace_key`
cookies are absent from the browser's DevTools → Application
→ Cookies panel.

**Cause**: the API is running over HTTP without `Secure`. The
cookies are `HttpOnly` (which is correct), but in development
they are not `Secure`. If the page is served over HTTPS, the
browser drops them unless the API is also HTTPS.

**Fix**: in development, serve both the API and the web console
over HTTP, or set up local TLS.

## Getting more help

- [GitHub issues](https://github.com/sachncs/revex/issues) for
  bugs and reproducible reports.
- [GitHub discussions](https://github.com/sachncs/revex/discussions)
  for "how do I…?" questions.
- [security@sachncs.dev](mailto:security@sachncs.dev) for
  private disclosure (see [Security](operations/security.md)).
- [Deployment](operations/deployment.md) for production
  topologies.
