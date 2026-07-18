# Development

Local setup, scripts, testing, and release packaging for ChatGPT Styler.

## Prerequisites

-   **Node.js 24.x** — [`.nvmrc`](../.nvmrc) pins `24.18.0` (Active LTS). `engines` in [`package.json`](../package.json) require `node >=24 <25` and `npm >=11`.
-   **npm** — only package manager. Exact versions via [`.npmrc`](../.npmrc) (`save-exact=true`, `engine-strict=true`). Do not add Yarn/pnpm lockfiles.
-   **Chromium browser** (Chrome, Edge, Brave, etc.) for loading the unpacked extension.

## Install

```bash
nvm use            # matches .nvmrc
npm ci             # preferred when lockfile is trusted
# or, when changing dependencies:
npm install
```

## Scripts

From [`package.json`](../package.json):

| Command                | Purpose                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Webpack watch with [`webpack.dev.js`](../webpack.dev.js) (inline source maps) → updates `dist/js/` |
| `npm run build`        | Production Webpack via [`webpack.prod.js`](../webpack.prod.js)                                     |
| `npm test`             | Jest with [`jest.config.js`](../jest.config.js)                                                    |
| `npm run test:ci`      | Jest in CI mode (`--ci --coverage=false`)                                                          |
| `npm run typecheck`    | `tsc --noEmit` (check only)                                                                        |
| `npm run lint:check`   | ESLint on `src/**/*.ts*` (check only)                                                              |
| `npm run format:check` | Prettier `--check` on `src/**/*.ts*`                                                               |
| `npm run validate`     | `typecheck` + `lint:check` + `format:check`                                                        |
| `npm run lint`         | ESLint **with `--fix`** on `src/**/*.ts*` (mutates files)                                          |
| `npm run prettify`     | Prettier **write** on `src/**/*.ts*` (mutates files)                                               |

Line endings: [`.gitattributes`](../.gitattributes) and Prettier `endOfLine: "lf"` keep LF in the repo so Windows clones don’t drown lint in CRLF noise.

TypeScript config: [`tsconfig.json`](../tsconfig.json) (`strict`, JSX react, path `@src/*`, `skipLibCheck`). ESLint: [`.eslintrc.js`](../.eslintrc.js). Prettier: [`.prettierrc.js`](../.prettierrc.js). Tailwind: [`tailwind.config.js`](../tailwind.config.js) + [`postcss.config.js`](../postcss.config.js). Webpack CSS pipeline uses `style-loader` + `css-loader` + `postcss-loader`.

**Note:** Runtime is Node 24 with TypeScript **4.9.5** and `@types/node` **24.x**. Jest is on **29.x**. A TypeScript 5.x jump can wait for a dedicated PR (now unblocked by the Jest modernization).

## Loading the unpacked extension

1. Run `npm run build` (or keep `npm run dev` running while iterating).
2. Open `chrome://extensions` (or your browser’s equivalent).
3. Enable **Developer mode**.
4. **Load unpacked** → select the repo’s [`dist/`](../dist/) directory (not the repo root).
5. Open [https://chatgpt.com](https://chatgpt.com), then open the extension popup from the toolbar.

After JS changes with `npm run dev`, use the extensions page **Reload** on ChatGPT Styler, then refresh the ChatGPT tab so the content script picks up the new bundle.

Static assets that Webpack does **not** emit (edit by hand when needed):

-   `dist/manifest.json`
-   `dist/popup.html`
-   Icons (`icon-16.png`, `icon-48.png`, `icon-128.png`)
-   Marketing image `dist/comparison.png`

Keep `version` in sync between `package.json`, top-level `package-lock.json`, and `dist/manifest.json`. These have drifted from each other (and from git tags) in the past — verify before tagging.

## Project conventions for contributors

-   Popup views/controls use named implementation files (`MessageEditor.tsx`, `ColorControls.tsx`) plus a barrel `index.ts`. Shared UI under `src/components/` uses PascalCase filenames. Colocate optional `styles.module.css` and tests under `__tests__/`.
-   `src/shared/` holds cross-entry domain/helpers; `src/lib/utilities/` holds Chrome/DOM adapters. Prefer documenting that boundary over merging folders.
-   Prefer `@src/...` imports over deep relative paths across packages.
-   Do not commit secrets; this extension has no backend API keys by design.
-   Human process / CoC: [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md).
-   Agent-oriented conventions: [`CLAUDE.md`](../CLAUDE.md).

## Tests

-   Runner: **Jest 29** + **ts-jest** + **jest-environment-jsdom**.
-   Roots: `src/`.
-   Module maps: `@src/(.*)` → `src/$1`; CSS → `identity-obj-proxy`.
-   Setup: [`src/setupTests.ts`](../src/setupTests.ts) stubs `chrome.storage` / `chrome.tabs` / `chrome.runtime`.
-   Extension APIs in product code use raw `chrome.*` (no `webextension-polyfill`).
-   Common patterns: `react-test-renderer` snapshots and prop wiring (no Enzyme).

Run:

```bash
npm test
```

Update snapshots intentionally when UI output changes (`jest -u` / accept in your workflow). Snapshot paths live next to tests under `__snapshots__/`.

## Release / CI

### Pull request / push CI

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

-   **Trigger:** push to `main`, and all pull requests.
-   **Steps:** checkout → Node from `.nvmrc` → `npm ci` → `typecheck` → `lint:check` → `format:check` → `test:ci`.
-   Local equivalent: `npm run validate && npm run test:ci`.

### Tag release artifacts

Workflow: [`.github/workflows/release-artifacts.yml`](../.github/workflows/release-artifacts.yml).

-   **Trigger:** push of any git tag (`*`).
-   **Steps:** same validation gates as PR CI, then `npm run build` → zip `dist/` as `dist-<tag>.zip` → upload artifact.
-   Action versions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`.
-   Uploads a build artifact only; it does **not** create a GitHub Release or publish to the Chrome Web Store.

Suggested release checklist:

1. Update [`CHANGELOG.md`](../CHANGELOG.md).
2. Bump version in `package.json`, `package-lock.json`, and `dist/manifest.json`.
3. `npm run build` and smoke-test unpacked `dist/` on chatgpt.com (confirm static assets still present).
4. Run `npm run validate && npm run test:ci` locally (CI also enforces this on the tag).
5. Commit, tag, push tag → download CI zip for store upload if needed.

Issue / PR templates: [`.github/ISSUE_TEMPLATE.md`](../.github/ISSUE_TEMPLATE.md), [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).

## Editor hints

-   [`.vscode/settings.json`](../.vscode/settings.json) / [`.vscode/extensions.json`](../.vscode/extensions.json) — recommended VS Code / Cursor workspace settings.

## Related docs

-   [architecture.md](architecture.md)
-   [dom-integration.md](dom-integration.md)
-   [../CLAUDE.md](../CLAUDE.md)
