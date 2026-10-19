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

| Command                | Purpose                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run dev`          | Webpack watch with [`webpack.config.js`](../webpack.config.js) and `--mode development` → updates `dist/js/` |
| `npm run build:dev`    | One-off development Webpack build (same flavor as `dev`, no watch)                                           |
| `npm run build`        | Alias for `build:prod`                                                                                       |
| `npm run build:prod`   | Production Webpack via [`webpack.config.js`](../webpack.config.js) and `--mode production`                   |
| `npm test`             | Jest with [`jest.config.js`](../jest.config.js)                                                              |
| `npm run test:ci`      | Jest in CI mode (`--ci --coverage=false`)                                                                    |
| `npm run typecheck`    | `tsc --noEmit` (check only)                                                                                  |
| `npm run lint:check`   | ESLint on `src/**/*.ts*` (check only)                                                                        |
| `npm run format:check` | Prettier `--check` on `src/**/*.ts*`                                                                         |
| `npm run validate`     | `typecheck` + `lint:check` + `format:check`                                                                  |
| `npm run lint`         | ESLint **with `--fix`** on `src/**/*.ts*` (mutates files)                                                    |
| `npm run prettify`     | Prettier **write** on `src/**/*.ts*` (mutates files)                                                         |

Line endings: [`.gitattributes`](../.gitattributes) and Prettier `endOfLine: "lf"` keep LF in the repo so Windows clones don’t drown lint in CRLF noise.

TypeScript config: [`tsconfig.json`](../tsconfig.json) (`strict`, JSX react, path `@src/*`, `skipLibCheck`). ESLint: [`.eslintrc.js`](../.eslintrc.js). Prettier: [`.prettierrc.js`](../.prettierrc.js). Tailwind: [`tailwind.config.js`](../tailwind.config.js) + [`postcss.config.js`](../postcss.config.js). Webpack CSS pipeline uses `style-loader` + `css-loader` + `postcss-loader`.

**Note:** Runtime is Node 24 with TypeScript **4.9.5**, React **18.3**, and `@types/node` **24.x**. Jest is on **29.x**. A TypeScript 5.x jump can wait for a dedicated PR.

## Loading the unpacked extension

1. Run `npm run build:prod` / `npm run build` (or `npm run build:dev` / keep `npm run dev` running while iterating).
2. Open `chrome://extensions` (or your browser’s equivalent).
3. Enable **Developer mode**.
4. **Load unpacked** → select the repo’s [`dist/`](../dist/) directory (not the repo root).
5. Open [https://chatgpt.com](https://chatgpt.com), then open the extension popup from the toolbar.

After JS changes with `npm run dev` or `npm run build:dev`, use the extensions page **Reload** on ChatGPT Styler, then refresh the ChatGPT tab so the content script picks up the new bundle.

### Build flavors

| Flavor      | Commands                              | Behavior                                                                                                               |
| ----------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Development | `npm run build:dev`, `npm run dev`    | Source maps; keeps debug logging; includes tools like **Repair & export selectors**                                    |
| Production  | `npm run build:prod`, `npm run build` | Minified; strips `console.log` / `info` / `debug` / `table`; omits dev-only UI; keeps `console.warn` / `console.error` |

### Dev-only selector inspector

With a **development** build (`npm run build:dev` or `npm run dev`), the popup shows the dev selector tools below the settings: **Repair layout** / **Undo repairs**, **Repair & export selectors**, **Audit on page**, and **Pick element**. Production builds omit them and never load repairs or overrides. When [Repair & export](#dev-only-repair--export) reports something broken or in need of review, the **selector inspector** helps find a replacement by hand. It opens as a panel on the chatgpt.com page itself (inside a Shadow DOM), because clicking the page closes the popup.

-   **Workbench** (popup **Audit on page**, or **Alt+Shift+A**): one card per selector in the [registry](../src/shared/selectors.ts). Heuristics locate each surface the extension depends on without relying on the current selectors, and every card shows the active selector's test result plus ranked replacement suggestions.
    -   **Check** dry-runs the draft in the card: validity, match count versus what the target expects, and how many of the heuristically found elements it covers. Matches are outlined on the page.
    -   **Apply** makes the extension use the draft immediately: generated CSS is rebuilt and scroll-to-top / the background layer remount. Applied selectors also get a **live effect** check where one exists, e.g. the matched bubbles really render your bubble color, the composer form really has your max-width, scroll-to-top really mounted in the host.
    -   **Reset** returns a card to its default; **Pick** lets you click the element on the page and **Use** one of its candidates.
    -   **Retest all** re-runs the heuristics and tests after you open menus, scroll, or switch chats.
-   **Pick element** (popup) or **Alt+Shift+P**: hover and click any element. The click is intercepted so ChatGPT does not react. The panel shows ranked selector candidates, which current extension selectors touch the element (self / ancestor / descendant), and a breadcrumb for jumping to parents.
-   **Show** outlines every match on the page for a few seconds.
-   Each card explains what the selector is **for** and what the right element **looks like** (from `description` / `lookFor` in the registry), to guide picking.
-   **Copy report** re-runs the audit and copies a paste-ready Markdown summary: failing selectors first with their notes, expected element, and top suggestions; then warnings, passing selectors, overrides in use, and page hints. In the element view it copies the picked element instead. **Save full JSON** downloads everything, including the page inventory. Both mask conversation / GPT / project ids and include no message text.

Suggestions skip UI-state attributes (`data-state`, `data-d-*`, router `data-discover`, ...), never pin state values such as `complete` or `open`, and turn indexed values (`fallback-turn-0`) into prefix selectors. When role turns share every attribute, the workbench also proposes `turn:has(marker)` selectors. Repair only accepts a suggestion that fully passes; warnings are left for you to judge.

Applied selectors are **dev-only overrides** saved in `chrome.storage.local` (`devSelectorOverrides`), so they survive reloads while you test. Production builds never load them, and Repair skips overridden keys. Once a replacement works, run **Repair & export** and paste its `registryPatch` into `src/shared/selectors.ts`, then **Reset all overrides**.

### Dev-only repair & export

**Repair & export selectors** (popup, development build) runs the same repair as the **Repair layout** button, then returns JSON describing the selector each key is actually using right now. It shows where that selector came from (`override`, `repaired`, `default`, `fallback`), its status, and its match count. The JSON is copied automatically. Its `registryPatch` holds the passing repaired or overridden selectors already shaped as `{ defaultSelector, fallbacks }`, so promoting them into `src/shared/selectors.ts` is copy-and-paste. The summary splits keys into `working`, `repaired`, `needsReview` (warnings), `broken`, and `notOnPage` (optional surfaces that are absent until a menu or composer state is open).

### Repair drill (simulated breaks)

To check that Repair can recover from a ChatGPT update without waiting for one, use the workbench's **Repair drill** row. **Break** on a card (or **Break all**) swaps that key's built-in selectors for one that matches nothing, as if ChatGPT had renamed the markup. The page styling breaks visibly. **Run Repair** then has to find replacements using the heuristics alone, and **Repair & export** also copies the export JSON. Simulated breaks live in memory only, so a page reload restores the built-ins. Unlike overrides, they are not skipped by Repair. Reset any overrides first, because Repair leaves overridden keys alone. Use **Undo repairs** (popup dev tools) afterwards to clear the repairs the drill saved.

Use the keyboard shortcuts for elements that only exist while a ChatGPT menu or dialog is open (profile menu, Settings → Data controls): opening the popup would close that UI first. Candidate logic lives in [`selectorDiscovery.ts`](../src/lib/utilities/selectorDiscovery.ts); it skips Tailwind utilities, Radix/React ids, UUIDs, and CSS-module hashes, and down-ranks `aria-label` because it is localized.

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
-   **Validation:** typecheck, lint, format check, and tests run once.
-   **Build smoke tests:** production and development flavors build concurrently after validation.
-   Local equivalent: `npm run validate && npm run test:ci && npm run build:prod && npm run build:dev`.

### Tagged releases

Workflow: [`.github/workflows/release.yml`](../.github/workflows/release.yml).

-   **Trigger:** push of any git tag (`*`).
-   **Validation:** typecheck, lint, format check, and tests run once.
-   **Builds:** production and development flavors build concurrently.
-   **Outputs:** both zips are retained as workflow artifacts and attached to an automatically created GitHub Release.
-   Tags containing a hyphen (for example, `1.3.1-RC1`) become pre-releases; final tags such as `1.3.1` become normal releases.
-   The production zip is the Chrome Web Store deliverable. The development zip is for sideloading and diagnostics.
-   The workflow does **not** publish to the Chrome Web Store.

See [releases.md](releases.md) for the RC commands, final-release checklist, artifact names, and tag guidance.

Issue / PR templates: [`.github/ISSUE_TEMPLATE.md`](../.github/ISSUE_TEMPLATE.md), [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).

## Editor hints

-   [`.vscode/settings.json`](../.vscode/settings.json) / [`.vscode/extensions.json`](../.vscode/extensions.json) — recommended VS Code / Cursor workspace settings.

## Related docs

-   [architecture.md](architecture.md)
-   [dom-integration.md](dom-integration.md)
-   [../CLAUDE.md](../CLAUDE.md)
