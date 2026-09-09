# Installation

Revex is a pnpm + Turbo TypeScript monorepo. Every component
runs on Node.js. There is no Python in the build path.

## Prerequisites

| Tool | Required | Notes |
|---|---|---|
| **Node.js** | 26.0+ | LTS line. `engines.node` in `package.json` pins the floor. |
| **pnpm** | 9.0+ | Workspace protocol for internal dependencies. |
| **TypeScript** | 5.6+ | Built into each package; only needed if you write TS. |
| **Git** | 2.30+ | For cloning the repository. |

Optional:

- **Docker** — to run the API in a container.
- **volta** or **fnm** — to match the pinned Node version
  without polluting your global install.

## Supported platforms

Revex is tested on:

- macOS 14+ (Apple Silicon and Intel).
- Ubuntu 22.04 LTS and newer.
- Windows 11 + WSL 2.

`better-sqlite3` and `@sqlite.org/sqlite-vec` ship with native
modules; `pnpm install` runs `pnpm rebuild` automatically on
post-install, but you can run it manually:

```bash
pnpm rebuild -r better-sqlite3 @sqlite.org/sqlite-vec
```

## Install pnpm

If pnpm is not installed:

```bash
corepack enable pnpm
corepack prepare pnpm@9.12.3 --activate
```

The repository pins pnpm 9.12.3 in `packageManager`. Corepack
honours the pin on every `pnpm` invocation.

## Clone and install

```bash
git clone https://github.com/sachncs/revex.git
cd revex
pnpm install
```

`pnpm install` links every package through the workspace
protocol; no rebuild step is required after editing
`packages/*/src/**`.

## Verify the install

```bash
pnpm typecheck   # tsc --noEmit across all packages
pnpm lint        # ESLint 9 flat config
pnpm test        # Vitest unit + integration
pnpm build       # Turbo build every package
```

All four commands must exit zero on a fresh clone.

## Dev container

If you use VS Code or GitHub Codespaces, the repository ships
with a `.devcontainer/devcontainer.json` that installs Node.js
26, pnpm 9, and the SQLite build chain. Open the repository in
the container and run `pnpm install` to start.

## Next steps

- [Quickstart](quickstart.md) — boot the API and the web
  console in two terminals and walk the onboarding wizard.
- [Configuration](configuration.md) — set the JWT secret, the
  workspace home, and the LLM provider.
