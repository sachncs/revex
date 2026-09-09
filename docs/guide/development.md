# Development

Guidelines for working inside the Revex monorepo.

## Toolchain

| Tool | Version / notes |
|---|---|
| Node.js | 26+ (LTS line before it), ESM only |
| pnpm | 9+ (workspace protocol for internal deps) |
| TypeScript | 5.6+, `strict` |
| Turbo | task orchestration |
| Vitest | unit + integration tests |
| fast-check | property tests |
| ESLint | 9.x flat config (shared base + per-package config) |
| Prettier | authoritative formatter |

## Commands (run from repo root)

```bash
pnpm install
pnpm typecheck       # tsc --noEmit across packages
pnpm lint            # ESLint 9 flat config across packages
pnpm test            # vitest run
pnpm build           # turbo build all packages
pnpm --filter @revex/core test
pnpm --filter @revex/api dev
```

The shared ESLint config lives at `eslint.base.config.mjs` (repo
root). Each package re-exports it from `eslint.config.mjs` and
adds an `ignores` block. The web app (`@revex/web`) keeps its own
config because it pulls in `eslint-config-next`.

## Layout

- `packages/core` — `@revex/core`, always installed, no internal deps.
- `packages/orchestrator` — `@revex/orchestrator`.
- `packages/api` — `@revex/api` (Hono HTTP).
- `packages/eval` — `@revex/eval`.
- `apps/web` — Next.js console.
- `apps/cli` — `@revex/cli` binary.

Cross-package imports use the workspace protocol (no `**/dist/**` paths).

## TypeScript style

- Strict flags: `noImplicitOverride`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`,
  `noImplicitReturns`.
- **No `any`**: use `unknown` + type guard, or cast at a narrow boundary.
- **Branded IDs**: `type UserId = string & { readonly __brand: 'UserId' }`.
- **Frozen value objects**: `Object.freeze(this)` in constructors, `readonly`
  fields.
- **No `enum`** — `const X = { A: 'a' } as const`.
- **Errors are classes** extending `RevexError` with stable string `code`s.
- Reserved names forbidden: `Object`, `Function`, `Promise`, `String`,
  `Number`, `Boolean`, `Error`, `Type`, `default`, `next`.
- Forbidden field shadowing: `id`, `name`, `length`, `value`, `type`,
  `parent`, `data`, `next`, `prev`, `open`, `close` — rename.
- Named exports in library code; every package root `index.ts` re-exports the
  public surface.

## Async & concurrency

- Async-first: anything that can suspend returns `Promise<T>`.
- Public async functions accept `signal?: AbortSignal`.
- `for await ... of` for streams.
- `Promise.all` / `Promise.allSettled` for parallelism.

## Testing

- Vitest; files under `test/` mirroring `src/`.
- One concept per test file (e.g. `test/retrieval/hybrid.test.ts`).
- `describe`/`it`; one assertion concept per `it` (use `toMatchInlineSnapshot`
  for multi-assertion).
- Coverage ≥ 80% per package.

## Formatting & lint

- Prettier is the authoritative formatter. Run `pnpm format`
  before pushing.
- ESLint 9 flat config is the lint entry point for every
  package. Run `pnpm lint` from the repo root; warnings do not
  fail the build but are surfaced in CI.
- The CI pipeline runs `lint`, `typecheck`, `test`, and `build`
  on every push and pull request to `master`.

## Git

Atomic, one logical change per commit. Conventional prefixes: `feat:`, `fix:`,
`refactor:`, `test:`, `docs:`, `chore:`, `perf:`.
Branch names: `feat/<short>`, `fix/<short>`, `refactor/<short>`.