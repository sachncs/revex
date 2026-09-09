# Architecture — Tenancy and encryption

Every workspace is one SQLite file on disk. The file holds
documents, embeddings, audit events, and (encrypted) settings.
This page explains how the boundaries are drawn and which
primitives seal what.

## Tenancy model

| Term | What it is |
|---|---|
| Workspace | One SQLite file at `${REVEX_WORKSPACE_HOME}/workspaces/<workspaceId>/workspace.db`. |
| Workspace member | A row in `workspace_member` granting a user a role. |
| Document principal | A row in `document_principal` scoping a document to a user, group, or role. |
| Group | A row in `workspace_group` + `workspace_group_member`; reusable across roles and document principals. |

The `WorkspaceRegistry` is a separate SQLite file at
`${REVEX_WORKSPACE_HOME}/registry.db`. It maps
`workspaceId → on-disk path + encryption scheme`.

## Encryption

### Per-workspace keys

- **Passphrase** — supplied on every login. Never persisted.
- **AES key** — 32 bytes, derived via
  `scrypt(passphrase, salt, N=2¹⁵, r=8, p=1, dkLen=32)`.
- **Salt** — 16 bytes, persisted in the `workspace_metadata`
  table.
- **IV** — 12 bytes per encryption, persisted alongside the
  ciphertext.
- **Auth tag** — 16 bytes, included with every AES-GCM record.

### What is sealed

- Every row in `workspace_settings` is encrypted at the field
  level (`provider`, `model`, `apiKey`, `baseUrl`).
- The `EncryptedField<T>` helper holds IV + ciphertext + tag;
  reads decrypt on the way out, writes encrypt on the way in.

### What is not sealed

- Document bodies are stored as plaintext chunks for indexing.
  Production deployments with at-rest-encryption requirements
  should use full-disk encryption (LUKS / dm-crypt / FileVault)
  on the workspace directory in addition to the per-field
  sealing above.
- Audit event rows are plaintext (so SIEM tools can ingest
  them). Strip sensitive fields at write time.
- Per-document user metadata is plaintext.

## Storage layer contracts

Every store takes a `Database` handle and operates on it
directly:

```ts
export interface UserStore {
  getByEmail(email: string): Promise<{ user: User; passwordHash: string } | null>;
  getById(workspaceId: WorkspaceId, id: UserId): Promise<{ user: User; passwordHash: string } | null>;
  create(input: {
    workspaceId: WorkspaceId;
    email: string;
    passwordHash: string;
    role: keyof typeof UserRole;
    allowedCompanies: readonly string[];
  }): Promise<User>;
  updatePassword(workspaceId: WorkspaceId, id: UserId, passwordHash: string): Promise<boolean>;
  close(): Promise<void>;
}
```

The contract is workspace-scoped: every read carries
`workspaceId` (and often `userId`) and the implementation uses
both as part of the SQL `WHERE`. There is no global lookup
shortcut.

## RBAC at retrieval time

Every retrieval call goes through `allowedCompanyFilter(user)`:

```ts
const acl = await handle.principalStore.listForDocument(documentId);
return acl.some((p) => matchesPrincipal(p, user));
```

If no ACL row matches, the document is filtered out before any
chunk is scored. The check is enforced at the storage layer,
not in the orchestrator — every code path that reads chunks
goes through it.

## Role hierarchy

| Role | Can manage members | Can edit settings | Can ingest | Can query |
|---|:---:|:---:|:---:|:---:|
| Owner | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ |
| Member |   |   | ✓ | ✓ |
| Viewer |   |   |   | ✓ |

`canManageWorkspace(role)` returns `true` for `owner` and
`admin`. Document-level ACLs add finer-grained scoping on top.

## Multi-workspace isolation

Each request that hits the API resolves its stores from
`WorkspaceContext.from(c)`. The context is bound to one
workspace; there is no shared `userStore` across workspaces. To
operate on workspace B from a JWT issued for workspace A, the
caller must mint a JWT for workspace B and re-authenticate.

## Migration: raghub → revex

The Python raghub series used Fernet (`REVEX_TENANT_SECRETS_KEY`)
to seal tenant secrets at the *tenant* level. The current
TypeScript code path derives the AES key from the workspace
passphrase via scrypt at the *workspace* level. There is no
wire-compatible bridge — see [Migration](../MIGRATION.md) for
the steps required to move an existing workspace.

## What's next

- [Encrypted workspace example](../examples/encrypted-workspace.md)
  — code-level walkthrough.
- [Security hardening](../operations/security.md) — the
  production checklist.
- [HTTP API reference](../reference/api.md) — every endpoint
  that crosses the workspace boundary.
