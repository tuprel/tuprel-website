# Tuprel Website

The standalone product and documentation website for [Tuprel](https://github.com/tuprel/tuprel), a schema-first Java toolkit for typed PostgreSQL access. The website has its own version, dependency lockfile, CI and deployment configuration.

## Run locally

Use Node.js 24, Git and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The development server reloads application edits. After changing the documentation pin or manifest, run `pnpm docs:sync` to regenerate its data.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js routes, static metadata, homepage, documentation and examples |
| `components/` | Shared navigation, search dialog, documentation layout and code blocks |
| `content/upstream.json` | Upstream commit, source paths and documentation order |
| `scripts/` | Documentation sync, generated-link validation and static preview |
| `tests/` | Unit and Playwright tests, including axe checks on desktop and mobile |
| `.github/workflows/ci.yml`, `vercel.json` | Website verification and hosting configuration |

## Documentation and examples

Tuprel’s technical documentation lives in [tuprel/tuprel](https://github.com/tuprel/tuprel). Update the full commit SHA in `content/upstream.json` to refresh the website. Manifest entries can render an entire Markdown source or expose a named section. The homepage extracts its Java and CLI examples from the same commit.

The sync reads Git objects from a sibling `tuprel` checkout when the pinned commit exists. Set `TUPREL_DOCS_SOURCE` to use another checkout or set `TUPREL_DOCS_REMOTE=1` to exercise the GitHub fetch path. Without a local commit, it fetches the pinned public GitHub sources. Missing files, sections and mapped Markdown links fail the build with the affected path. A local working tree edit never changes the published input by itself.

Markdown is parsed as GFM, converted to a sanitized syntax tree and rendered as React elements. Source HTML passes through an allowlist, while Markdown links to imported pages map to internal routes and other repository references resolve against the pinned revision. Search uses a static index generated from page titles, headings and text. The browser loads it when the search dialog opens.

## Verify

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:links
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit
```

Run `pnpm preview` to serve the exported files at [http://127.0.0.1:4173](http://127.0.0.1:4173). To test against a locally installed Chromium-based browser, set `PLAYWRIGHT_CHANNEL` to `chrome` or `msedge`. The link checker validates exported internal routes and fragments. Source sync validates referenced paths inside the pinned repository. Third-party URLs remain external.

## Deploy

Import the website repository into Vercel as a separate Next.js project. Use Node.js 24 and the root directory of this repository. Set `ENABLE_EXPERIMENTAL_COREPACK=1` in the Vercel project so the build uses the exact pnpm version in `package.json`. The checked-in Vercel configuration runs `pnpm build` and serves `out/`. Vercel’s Git integration can create PR previews and deploy the selected production branch independently of the Java build.

Set `SITE_URL` in the Production environment to the confirmed HTTPS origin before deploying publicly. It drives canonical URLs, Open Graph URLs and the sitemap. Leave it unset in preview environments to keep their robots policy closed. Static hosting can serve the same `out/` directory with index routing and a 404 fallback.

## Dependencies and scope

Next.js and React provide static App Router pages and interactive controls. Tailwind handles the CSS build and utility baseline. Manrope is self-hosted, and Lucide supplies SVG icons. The unified/remark/rehype toolchain handles Markdown and sanitization. Lowlight highlights examples at build time. No server database, external search account or client Markdown evaluator is required.

ESLint, Playwright and axe are development tools. The lockfile pins the transitive graph. The scoped `minimatch` override in `pnpm-workspace.yaml` addresses [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) in the TypeScript lint toolchain.

The installation guide covers source builds. Public installers and library distribution depend on Tuprel’s release gates. The roadmap distinguishes the Development Preview, staging evidence and public Beta requirements.

Code in this repository is licensed under Apache 2.0. Imported documentation and examples retain their upstream licensing. Manrope is licensed under the SIL Open Font License and Lucide under the ISC license.
