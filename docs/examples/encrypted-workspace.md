# Encrypted workspace

Walk through the encrypted-workspace flow: scrypt-derived
AES-256-GCM keys, the passphrase cookie flow on every request,
and per-workspace RBAC at the storage layer.

## Prerequisites

```bash
pnpm install
pnpm --filter @revex/core build
```

## What "encrypted" means here

Every workspace is one SQLite file. Two tables in that file are
sealed with AES-256-GCM:

- `workspace_settings` — LLM provider config, model name, API
  keys, base URLs.
- Anything written through `EncryptedField<T>` — the typed
  helper that holds an IV + ciphertext + auth tag.

The 32-byte AES key is **never** stored. It is derived from the
workspace passphrase via scrypt with `N=2¹⁵, r=8, p=1`. Lose the
passphrase and the sealed rows stay opaque — there is no
recovery path.

## Open an encrypted workspace

```ts
import { openEncryptedWorkspace, brandId } from '@revex/core';

const passphrase = process.env['WORKSPACE_PASSPHRASE'];
if (!passphrase) throw new Error('WORKSPACE_PASSPHRASE is required');

const handle = await openEncryptedWorkspace({
  path: './workspace.db',
  passphrase,
});

const workspaceId = handle.workspaceId;
const userId = brandId('usr_owner');

// Sealed write — every value goes through the AES-GCM seal.
await handle.settings.set('llm', {
  provider: 'openai',
  model: 'gpt-4.1',
  apiKey: process.env['OPENAI_API_KEY'] ?? '',
  baseUrl: 'https://api.openai.com/v1',
  temperature: 0,
});

// Sealed read — decrypts on the way out.
const llm = await handle.settings.get('llm');
console.log(llm.provider, llm.model);

handle.close();
```

## The passphrase cookie flow

The web console sends the passphrase on every request via the
`revex_workspace_key` cookie. The cookie is `HttpOnly; Secure;
SameSite=Lax` — it can never be read from JavaScript, so an XSS
on the page cannot exfiltrate it.

On every authenticated request, the API:

1. Verifies the JWT in the `Authorization` header (or the
   `revex_session` cookie).
2. Reads the passphrase from the `revex_workspace_key` cookie.
3. Resolves the workspace via the `WorkspaceRegistry`.
4. Opens (or reuses from the `WorkspacePool`) the encrypted
   workspace handle, with the passphrase as the unlock key.
5. Resolves per-request stores from the handle.

```ts
import { workspaceContextFrom, type WorkspacePool } from '@revex/api';

// Inside a route handler:
const ctx = await workspaceContextFrom(c, {
  pool,
  embedder,
  vectorStore,
});

// ctx.memberStore, ctx.documentStore, ctx.jobQueue, …
// All instances are bound to the unlocked workspace; using a
// different passphrase would yield a different handle and a
// different scope of data.
```

## Per-workspace RBAC at the storage layer

The `workspace_member` and `document_principal` tables are the
two authorization boundaries. Every storage call uses
`workspaceId` and `userId` to scope reads and writes:

```ts
import {
  canManageWorkspace,
  WorkspaceMemberRole,
} from '@revex/core';

const member = await handle.memberStore.get(workspaceId, userId);
if (!member || !canManageWorkspace(member.role)) {
  return c.json({ error: { code: 'authorization_error', message: 'admin required' } }, 403);
}
```

Document-level ACLs add a second axis. A document can be
scoped to a user, a group, or a role via
`document_principal`. Retrieval filters by the resulting
`allowedCompanyFilter(user)` before any chunk is scored:

```ts
const acl = await handle.principalStore.listForDocument(documentId);
if (!acl.some((p) => matchesPrincipal(p, user))) {
  // Filtered out before retrieval.
}
```

## Re-keying a workspace

There is no built-in re-key command yet. To rotate the
passphrase:

1. Decrypt every sealed row with the old passphrase.
2. Encrypt every sealed row with the new passphrase.
3. Persist a key-version marker so old clients can detect the
   transition.

Track this in
[GitHub issue tracker](https://github.com/sachncs/revex/issues)
— a one-shot migration script is on the roadmap.

## What's next

- [Custom plugin](custom-plugin.md) — extend the orchestrator
  with your own retriever or scorer.
- [Security hardening](../operations/security.md) — what the
  production hardening checklist looks like for encrypted
  workspaces.
- [Tenancy and encryption](../architecture/tenancy.md) — the
  design rationale.
