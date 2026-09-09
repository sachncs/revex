# Contributing

Thanks for your interest in Revex. This guide explains how to set up
a development environment, run the test suite, and submit a change.

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
Please report unacceptable behavior to the maintainers.

## Toolchain

Revex is a pnpm + Turbo monorepo written in TypeScript.

| Tool | Required version |
|---|---|
| Node.js | 26.0+ |
| pnpm | 9.0+ |
| TypeScript | 5.6+ |

If pnpm is not installed, enable it via Corepack:

```bash
corepack enable pnpm
```

The CI pipeline pins Node.js to the version in `.nvmrc` and pnpm to
`9.12.3`. Local development is most reliable when you match those
versions; Volta (a `volta` block is included in `package.json`) or
`fnm` both work well.

## Development setup

```bash
git clone https://github.com/sachncs/revex.git
cd revex
pnpm install
pnpm typecheck   # tsc --noEmit across all packages
pnpm lint        # eslint via turbo
pnpm test        # vitest unit + integration
pnpm build       # turbo build all packages
```

`pnpm install` runs against the workspace manifest; every package
links via the workspace protocol, so no rebuild step is required
after editing `packages/*/src/**`.

### Running the API and web console locally

Two processes are required for a working end-to-end loop:

```bash
# Terminal 1 — HTTP API (Hono)
pnpm --filter @revex/api dev      # http://localhost:3000

# Terminal 2 — Web console (Next.js)
pnpm --filter @revex/web dev      # http://localhost:3001
```

Open `http://localhost:3001/onboarding` and walk the 5-step wizard
to create a workspace.

### Running the CLI

```bash
pnpm --filter @revex/cli dev -- --help
```

The CLI binary is also installable globally once published:

```bash
pnpm i -g @revex/cli
revex --help
```

## Repository layout

```
revex/
├── packages/
│   ├── core/          @revex/core          domain, stores, retrieval, auth, telemetry, LLM
│   ├── orchestrator/  @revex/orchestrator  Strands-shaped Orchestrator + agents + tools
│   ├── api/           @revex/api           Hono HTTP server
│   └── eval/          @revex/eval          retrieval metrics + benchmarks
├── apps/
│   ├── web/           @revex/web           Next.js 16 console (private)
│   └── cli/           @revex/cli           `revex` binary
├── docs/              documentation source (MkDocs Material)
└── mkdocs.yml         documentation site config
```

Cross-package imports go through `@revex/core` and `@revex/orchestrator`
only — never through `**/dist/**` paths.

## TypeScript conventions

- All packages are ESM and `strict` TypeScript. The shared
  `tsconfig.base.json` enables `noImplicitOverride`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noFallthroughCasesInSwitch`, and `noImplicitReturns`.
- **No `any`.** Use `unknown` and a narrow type guard, or cast at a
  single boundary.
- **Branded IDs.** `type UserId = string & Brand<'UserId'>` and the
  `brandId()` constructor keep IDs from being mixed at the type
  level.
- **Frozen value objects.** Domain classes call `Object.freeze(this)`
  in their constructor and use `readonly` fields.
- **No `enum`.** Use `const X = { A: 'a' } as const` plus a derived
  type alias.
- **Errors are classes.** Every error extends `RevexError` and has
  a stable `code` string (see the error table in
  `docs/reference/api.md`).
- **Reserved names** — `Object`, `Function`, `Promise`, `String`,
  `Number`, `Boolean`, `Error`, `Type`, `default`, `next` are
  forbidden as identifiers. Shadow `id`, `name`, `length`, `value`,
  `type`, `parent`, `data`, `next`, `prev`, `open`, `close` by
  renaming.

## Async and concurrency

- Async-first: any function that can suspend returns `Promise<T>`.
- Public async functions accept `signal?: AbortSignal` and honor it.
- Stream consumption uses `for await ... of`.
- Parallel work uses `Promise.all` (fail-fast) or
  `Promise.allSettled` (collect errors).

## Testing

- Vitest. Files live under `test/` mirroring `src/`.
- One concept per test file
  (e.g. `test/retrieval/hybrid.test.ts`).
- `describe` / `it` blocks; one assertion concept per `it`, with
  `toMatchInlineSnapshot` for multi-assertion cases.
- Property tests live under `test/properties/` using fast-check.
- Contract tests live under `test/contract/`.
- Per-package coverage floor is 80%; CI tracks the trend.

## Formatting and lint

- Prettier is the authoritative formatter. Run `pnpm format`
  before pushing.
- ESLint 9 flat config (`eslint .`) is the lint entry point for
  every package. Run `pnpm lint` from the repo root.
- The CI pipeline runs `lint`, `typecheck`, `test`, and `build`
  on every push and pull request to `master`.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/).

| Prefix | Use for |
|---|---|
| `feat:` | New user-facing capability. |
| `fix:` | Bug fix. Reference the issue (`Fixes #N`). |
| `refactor:` | Internal change with no user-facing effect. |
| `test:` | New or updated tests only. |
| `docs:` | Documentation-only change. |
| `chore:` | Build, tooling, or repo hygiene. |
| `perf:` | Performance improvement. |

Branch names mirror the prefix: `feat/<short-slug>`,
`fix/<short-slug>`, etc.

## Pull request process

1. Branch from `master`. Make atomic commits.
2. Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
   locally before pushing.
3. Open a pull request against `master` using the
   `.github/PULL_REQUEST_TEMPLATE.md` template.
4. Wait for CI. Address review feedback in additional commits.
5. Squash-merge once approved.

## Security

Found a security issue? **Do not open a public issue.** Follow the
disclosure process in [`SECURITY.md`](./SECURITY.md).

## License

Revex is released under the [MIT License](./LICENSE). By
contributing, you agree that your contributions are licensed under
the same terms.
