# Development

Local setup, scripts, testing, and release packaging for ChatGPT Styler.

## Prerequisites

- **Node.js 24.x** — [`.nvmrc`](../.nvmrc) pins `24.18.0` (Active LTS). `engines` in [`package.json`](../package.json) require `node >=24 <25` and `npm >=11`.
- **npm** — only package manager. Exact versions via [`.npmrc`](../.npmrc) (`save-exact=true`, `engine-strict=true`). Do not add Yarn/pnpm lockfiles.
- **Chromium browser** (Chrome, Edge, Brave, etc.) for loading the unpacked extension.

## Install

```bash
nvm use            # matches .nvmrc
npm ci             # preferred when lockfile is trusted
# or, when changing dependencies:
npm install
```

## Scripts

From [`package.json`](../package.json):

| Command | Purpose |
|---------|---------|
| `npm run dev` | Webpack watch with [`webpack.dev.js`](../webpack.dev.js) (inline source maps) → updates `dist/js/` |
| `npm run build` | Production Webpack via [`webpack.prod.js`](../webpack.prod.js) |
| `npm test` | Jest with [`jest.config.js`](../jest.config.js) |
| `npm run lint` | ESLint **with `--fix`** on `src/**/*.ts*` (mutates files) |
| `npm run prettify` | Prettier **write** on `src/**/*.ts*` (mutates files) |

Check-only alternatives: `npx eslint -c ./.eslintrc.js "src/**/*.ts*"`, `npx prettier --check "src/**/*.ts*"`, `npx tsc --noEmit`.

TypeScript config: [`tsconfig.json`](../tsconfig.json) (`strict`, JSX react, path `@src/*`, `skipLibCheck`). ESLint: [`.eslintrc.js`](../.eslintrc.js). Prettier: [`.prettierrc.js`](../.prettierrc.js). Tailwind: [`tailwind.config.js`](../tailwind.config.js) + [`postcss.config.js`](../postcss.config.js). Webpack CSS pipeline uses `style-loader` + `css-loader` + `postcss-loader`.

**Note:** Runtime is Node 24, but `@types/node` remains on a TypeScript 4.5-compatible pin. Bumping `@types/node` to match Node 24 requires upgrading TypeScript first.

## Loading the unpacked extension

1. Run `npm run build` (or keep `npm run dev` running while iterating).
2. Open `chrome://extensions` (or your browser’s equivalent).
3. Enable **Developer mode**.
4. **Load unpacked** → select the repo’s [`dist/`](../dist/) directory (not the repo root).
5. Open [https://chatgpt.com](https://chatgpt.com), then open the extension popup from the toolbar.

After JS changes with `npm run dev`, use the extensions page **Reload** on ChatGPT Styler, then refresh the ChatGPT tab so the content script picks up the new bundle.

Static assets that Webpack does **not** emit (edit by hand when needed):

- `dist/manifest.json`
- `dist/popup.html`
- Icons (`icon-16.png`, `icon-48.png`, `icon-128.png`)
- Marketing image `dist/comparison.png`

Keep `version` in sync between `package.json`, top-level `package-lock.json`, and `dist/manifest.json`. These have drifted from each other (and from git tags) in the past — verify before tagging.

## Project conventions for contributors

- Colocate components with `component.tsx` / `index.tsx`, optional `styles.module.css`, and `__tests__` or `__test__`.
- Prefer `@src/...` imports over deep relative paths across packages.
- Do not commit secrets; this extension has no backend API keys by design.
- Human process / CoC: [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md).
- Agent-oriented conventions: [`CLAUDE.md`](../CLAUDE.md).

## Tests

- Runner: **Jest** + **ts-jest**.
- Roots: `src/`.
- Module maps: `@src/(.*)` → `src/$1`; CSS → `jest-css-modules`.
- Common patterns: `react-test-renderer` snapshots; some Enzyme `shallow` tests (MiscEditor).
- Browser APIs: mock `webextension-polyfill` ([`src/__mocks__/webextension-polyfill.ts`](../src/__mocks__/webextension-polyfill.ts)); tests that hit `chrome.*` typically stub globals.

Run:

```bash
npm test
```

Update snapshots intentionally when UI output changes (`jest -u` / accept in your workflow). Snapshot paths live next to tests under `__snapshots__/`.

**Note:** Some suites currently fail without docs changes (missing Enzyme adapter for shallow tests, incomplete `webextension-polyfill` mock for `runtime.connect`, and brittle `findByType("button")` assumptions in DeleteAllChatsButton tests). Treat a green suite as a goal when touching those areas; do not assume `npm test` is fully green on a fresh clone.

## Release / CI

Workflow: [`.github/workflows/release-artifacts.yml`](../.github/workflows/release-artifacts.yml).

- **Trigger:** push of any git tag (`*`).
- **Steps:** checkout → Node from `.nvmrc` (24.x) with npm cache → `npm ci` → `npm run build` → zip `dist/` as `dist-<tag>.zip` → upload artifact.
- Action versions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`.
- Uploads a build artifact only; it does **not** create a GitHub Release or publish to the Chrome Web Store.
- There is **no** pull-request CI for test/lint/typecheck today.

Suggested release checklist:

1. Update [`CHANGELOG.md`](../CHANGELOG.md).
2. Bump version in `package.json`, `package-lock.json`, and `dist/manifest.json`.
3. `npm run build` and smoke-test unpacked `dist/` on chatgpt.com (confirm static assets still present).
4. Run `npm test` and check-only lint/prettier/tsc; fix or knowingly accept known test gaps.
5. Commit, tag, push tag → download CI zip for store upload if needed.

Issue / PR templates: [`.github/ISSUE_TEMPLATE.md`](../.github/ISSUE_TEMPLATE.md), [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).

## Editor hints

- [`.vscode/settings.json`](../.vscode/settings.json) / [`.vscode/extensions.json`](../.vscode/extensions.json) — recommended VS Code / Cursor workspace settings.

## Related docs

- [architecture.md](architecture.md)
- [dom-integration.md](dom-integration.md)
- [../CLAUDE.md](../CLAUDE.md)
