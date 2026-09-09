# Quickstart

This page takes you from a fresh clone to a running `POST
/v1/query` against your own documents in about ten minutes. By
the end you'll have the API on `:3000`, the web console on
`:3001`, and a workspace with one ingested document.

## Prerequisites

- Node.js 26+ and pnpm 9+ — see [Installation](install.md).
- An OpenAI API key (or any other supported LLM provider — the
  API key is encrypted with the workspace passphrase before it
  hits the database).

## 1. Clone and install

```bash
git clone https://github.com/sachncs/revex.git
cd revex
pnpm install
```

## 2. Configure secrets

```bash
cp .env.example .env
```

Generate the JWT secret:

```bash
openssl rand -base64 48
```

Paste the value into `REVEX_JWT_SECRET` in `.env`. The runtime
refuses to start with a secret shorter than 32 characters — see
[Configuration](configuration.md) for the full env var list.

## 3. Boot the API

In **terminal 1**:

```bash
pnpm --filter @revex/api dev
```

The server logs:

```text
revex-api listening on http://localhost:3000
```

The Hono server exposes the health endpoint at
`http://localhost:3000/health`. Confirm it:

```bash
curl http://localhost:3000/health
# {"ok":true}
```

## 4. Boot the web console

In **terminal 2**:

```bash
pnpm --filter @revex/web dev
```

The console logs:

```text
▲ Next.js 16.3.3
- Local: http://localhost:3001
```

Open <http://localhost:3001> in a browser.

## 5. Walk the onboarding wizard

The 5-step wizard at <http://localhost:3001/onboarding> creates
a workspace, an admin user, and the LLM provider settings in
one round-trip.

1. **Workspace** — `Acme Research`.
2. **Admin** — `you@example.com`, password ≥ 8 chars.
3. **LLM provider** — `openai`, `gpt-4.1`, paste your
   `OPENAI_API_KEY`.
4. **Passphrase** — a passphrase ≥ 8 chars. This unlocks the
   encrypted workspace on every subsequent login. **Keep a copy
   in your password manager.**
5. **Confirm** — submit.

The browser is redirected to `/chat`. The API has set two
cookies:

- `revex_session` — the JWT (`HttpOnly; Secure; SameSite=Lax`).
- `revex_workspace_key` — the workspace passphrase
  (`HttpOnly; Secure; SameSite=Lax`).

Both cookies are server-issued; the browser does not need (and
must not be allowed) to write them from JavaScript.

## 6. Ingest your first document

Drag a PDF, Markdown, or text file onto the **Documents** page.
The API returns `202 { status: 'pending' }` and a background
worker per workspace runs `ingest()`:

- chunk → embed → persist to `sqlite-vec` and FTS5.
- emit `ingest.complete` or `ingest.failure` to the audit log.

The page polls every 2 seconds until the row leaves
`pending` / `indexing`. A 1 MB PDF typically finishes in under
five seconds.

## 7. Run your first query

From the chat page:

> _"Summarise the document I just uploaded."_

The orchestrator streams the answer back through SSE. Open the
trace panel to see which retrievers fired (vector, keyword,
graph, memory) and which citations were attached.

From the CLI:

```bash
pnpm --filter @revex/cli dev -- query \
  --workspace ~/.revex/workspaces/<workspace-id> \
  --passphrase "$REVEX_WORKSPACE_PASSPHRASE" \
  "Summarise the document I just uploaded."
```

## 8. Verify with the API

```bash
curl -X POST http://localhost:3000/v1/query \
  -H "Authorization: Bearer $REVEX_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "what is the document about?",
    "topK": 5
  }'
```

The response includes the answer, citations, and per-retriever
hits. See [HTTP API](reference/api.md) for the full schema.

## What's next

- **Production?** Read [Security hardening](operations/security.md)
  and [Deployment](operations/deployment.md) before exposing
  the API outside `localhost`.
- **Custom retrievers or tools?** Start with
  [Examples / Custom plugin](examples/custom-plugin.md).
- **Something is broken?** See [Troubleshooting](troubleshooting.md).
