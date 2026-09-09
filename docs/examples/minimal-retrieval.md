# Minimal retrieval

The smallest possible useful program against `@revex/core`. It
opens a workspace, ingests two text snippets, runs a hybrid
query, and prints the top three hits.

## Prerequisites

```bash
pnpm install
pnpm --filter @revex/core build
```

## Code

```ts
// src/index.ts
import {
  Workspace,
  WorkspacePool,
  openWorkspace,
  hybridSearch,
  reciprocalRankFusion,
  registerBuiltInRerankers,
} from '@revex/core';

async function main(): Promise<void> {
  // Open (or create) the on-disk workspace.
  const handle = await openWorkspace({ path: './workspace.db' });

  // Persist two short documents.
  await handle.documents.upsert({
    workspaceId: handle.workspaceId,
    ownerId: handle.ownerId,
    filename: 'security.md',
    mimeType: 'text/markdown',
    hash: 'sha256:security',
    byteSize: 1,
    metadata: {},
    text: 'Encryption at rest uses AES-256-GCM with a per-workspace key derived via scrypt.',
  });
  await handle.documents.upsert({
    workspaceId: handle.workspaceId,
    ownerId: handle.ownerId,
    filename: 'auth.md',
    mimeType: 'text/markdown',
    hash: 'sha256:auth',
    byteSize: 1,
    metadata: {},
    text: 'Sign-in uses bcrypt password hashes and HS256-signed JWTs.',
  });

  registerBuiltInRerankers();

  // Run a hybrid query. The Retrieval class wires dense + BM25
  // under the hood and applies Reciprocal Rank Fusion.
  const { hits } = await hybridSearch({
    workspaceId: handle.workspaceId,
    userId: handle.ownerId,
    query: 'how are JWTs signed?',
    topK: 3,
    retrievers: ['vector', 'keyword'],
  });

  for (const hit of hits.slice(0, 3)) {
    console.log(`score=${hit.score.toFixed(3)}  ${hit.chunk.documentId}/${hit.chunk.id}`);
    console.log(`  ${hit.chunk.text}`);
  }

  handle.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Walkthrough

1. **`openWorkspace({ path })`** — opens or creates the SQLite
   file. Use `openEncryptedWorkspace({ path, passphrase })` for
   the encrypted variant.
2. **`handle.documents.upsert(...)`** — persists a document row
   and chunks it. The text field on the row is the source; the
   chunker splits it into retrievable segments.
3. **`hybridSearch(...)`** — runs the dense + BM25 retrievers in
   parallel and applies RRF. The `retrievers` array lets you
   limit the surface; omit it to use every registered retriever.
4. **`reciprocalRankFusion(...)`** — exposed separately so you
   can call it on raw hit lists. The default `k=60` is
   reasonable for most workloads; lower `k` weights top ranks
   more.
5. **`handle.close()`** — flushes the per-handle connections.

## Run it

```bash
pnpm tsx src/index.ts
```

The output should look like:

```text
score=0.812  sha256:auth/<chunk-id>
  Sign-in uses bcrypt password hashes and HS256-signed JWTs.
score=0.354  sha256:security/<chunk-id>
  Encryption at rest uses AES-256-GCM with a per-workspace key derived via scrypt.
```

The `auth` document wins because both the dense embedding and
the BM25 score align with the query "JWTs signed".

## Variations

- **Add a reranker** — replace the `reciprocalRankFusion`
  step with `createReranker('bge').rerank(hits)`. See the
  [rerankers guide](../guide/retrieval.md#rerankers).
- **Stream the answer** — wrap the same call in
  `orchestrator.stream({...})` to get SSE chunks back. See
  [Orchestration](../guide/orchestration.md).
- **Add a custom retriever** — register it via
  `PluginRegistry.register('retriever', 'myretriever', myFn)`.
  See [Custom plugin](custom-plugin.md).

## What's next

- [Encrypted workspace](encrypted-workspace.md) — the scrypt +
  AES-256-GCM flow with a passphrase.
- [Custom plugin](custom-plugin.md) — plug your own retriever
  into the orchestrator.
- [Hybrid retrieval](../guide/retrieval.md) — the algorithm
  walkthrough.
