# Revex product site

A premium, standalone product landing page for Revex — built with Vite + React + TypeScript + Tailwind CSS and deployed to GitHub Pages.

## Stack

- **[Vite](https://vite.dev)** + React 19 + TypeScript
- **[Tailwind CSS v4](https://tailwindcss.com)** for styling
- **[Framer Motion](https://www.framer.com/motion/)** for subtle motion
- **[Lucide](https://lucide.dev)** for icons
- **[Radix Slot](https://www.radix-ui.com)** for polymorphic primitives

## Structure

```
site/
├── index.html              # Entry HTML (with theme bootstrap script)
├── public/                 # Static assets copied as-is
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── _redirects          # GitHub Pages SPA fallback
│   └── .nojekyll           # Disable Jekyll for GitHub Pages
├── src/
│   ├── App.tsx             # Root layout
│   ├── main.tsx            # React entry
│   ├── index.css           # Design tokens + Tailwind
│   ├── components/
│   │   ├── brand/          # Logo mark, wordmark
│   │   ├── ui/             # Button, Badge, Card, Kbd, Separator
│   │   └── sections/       # Header, Hero, TrustStrip, Capabilities,
│   │                       # Platform, Governance, Solutions, FAQ,
│   │                       # FinalCta, Footer, LiveQuery
│   ├── data/content.ts     # All page copy and structured data
│   └── lib/                # cn(), theme hook
├── vite.config.ts
├── tsconfig.app.json
└── tsconfig.node.json
```

## Scripts

```bash
pnpm install       # install deps
pnpm dev           # start dev server (Vite)
pnpm build         # production build → dist/
pnpm preview       # preview production build
pnpm typecheck     # tsc -b
```

## Design system

- **Color** — OKLCH-based palette with brand indigo → amber gradient. Full dark mode.
- **Type** — Inter (UI), JetBrains Mono (code), Instrument Serif (accents).
- **Surface** — glass / soft borders / subtle radial mesh backgrounds.
- **Motion** — Framer Motion `whileInView` reveals, eased transitions.

## Deployment

The site is deployed to GitHub Pages by `.github/workflows/pages.yml`. The workflow:

1. Installs site dependencies.
2. Builds to `site/dist/`.
3. Uploads `site/dist/` as the GitHub Pages artifact.
4. Deploys via `actions/deploy-pages@v4`.

Base path is configured with `base: './'` in `vite.config.ts`, so the site works under any GitHub Pages subpath.