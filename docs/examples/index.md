# Examples

Revex ships as a library. Each example is a focused walkthrough
that compiles and runs against the published packages.

The examples are ordered from simplest to most advanced. Read
them in order if you're new to the engine.

| Example | What it teaches |
|---|---|
| [Minimal retrieval](minimal-retrieval.md) | `hybridSearch` + RRF + a reranker, end to end. |
| [Encrypted workspace](encrypted-workspace.md) | scrypt + AES-256-GCM, the passphrase cookie flow, RBAC at the storage layer. |
| [Custom plugin](custom-plugin.md) | How to register a custom retriever, scorer, or telemetry adapter. |

## Before you start

Every example assumes:

```bash
pnpm install
pnpm --filter @revex/core build
```

The `@revex/core` package must be built once (its `dist/`
output is what the examples import from). The build step runs
on `pnpm install` via Turbo, but you can run it explicitly if
you have just edited the source.

## Project layout for examples

```text
your-app/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts     # the example code
```

The examples use ESM imports and the workspace protocol. If you
copy an example outside the monorepo, replace the
`@revex/core` import with your package manager of choice:

```ts
// In the monorepo:
import { hybridSearch } from '@revex/core';

// Outside the monorepo, after `pnpm add @revex/core`:
import { hybridSearch } from '@revex/core';
```

## Where to look next

- [Hybrid retrieval](guide/retrieval.md) — the algorithm
  walkthrough.
- [Architecture overview](architecture/overview.md) — how the
  packages fit together.
- [HTTP API reference](reference/api.md) — if you'd rather not
  write a client and just want the HTTP surface.
