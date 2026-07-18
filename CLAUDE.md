# CLAUDE.md — ChatGPT Styler

Agent-oriented guide for working in this repository. For deeper detail, see [docs/](docs/README.md).

## What this project is

**ChatGPT Styler** is a Chromium Manifest V3 extension that customizes the ChatGPT UI (`chatgpt.com`). Users adjust message colors, widths, padding, border radius, and input-box width from a React popup. A content script injects generated CSS into the page, mounts a scroll-to-top control, and can drive ChatGPT’s “delete all chats” UI via DOM automation.

-   Package name / version: `chatgpt-styler` `1.2.3` ([`package.json`](package.json))
-   Store / product context: see [`README.md`](README.md)
-   Release history: [`CHANGELOG.md`](CHANGELOG.md)

## Source map

| Path                                                                                         | Role                                                                                                                                                              |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/popup/`](src/popup/)                                                                   | Extension popup UI (React). Entry: [`src/popup/index.tsx`](src/popup/index.tsx). Root: [`src/popup/Popup.tsx`](src/popup/Popup.tsx).                              |
| [`src/popup/views/messageEditor/`](src/popup/views/messageEditor/)                           | **Active** settings UI: sliders, color pickers, save/cancel/defaults, delete-all button.                                                                          |
| [`src/contentScript.ts`](src/contentScript.ts)                                               | Injected on `*://chatgpt.com/*`. Loads settings → CSS; listens for style / delete messages; mounts scroll-to-top.                                                 |
| [`src/backgroundPage.ts`](src/backgroundPage.ts)                                             | Service worker. Holds in-memory settings from the popup port; persists on popup disconnect.                                                                       |
| [`src/shared/settings.ts`](src/shared/settings.ts)                                           | Domain `Settings` interface and `defaultSettings`.                                                                                                                |
| [`src/shared/utils/stylingFunctions.ts`](src/shared/utils/stylingFunctions.ts)               | Pure `buildCss(settings)` → CSS string; `sendMessageToTab` for live preview.                                                                                      |
| [`src/shared/messaging/`](src/shared/messaging/)                                             | Typed extension message contracts (content-script + popup port).                                                                                                  |
| [`src/lib/utilities/settingsStorage.ts`](src/lib/utilities/settingsStorage.ts)               | `getOptionsFromStorage`, `saveOptionsToStorage` (`chrome.storage.sync`).                                                                                          |
| [`src/lib/utilities/deleteAllChats.ts`](src/lib/utilities/deleteAllChats.ts)                 | DOM automation for delete-all.                                                                                                                                    |
| [`src/lib/utilities/removeUnnecessarySpace.ts`](src/lib/utilities/removeUnnecessarySpace.ts) | Strips ChatGPT layout classes that fight custom widths.                                                                                                           |
| [`src/components/`](src/components/)                                                         | Shared UI: Header, FormButtons, DeleteAllChatsButton, ScrollToTop.                                                                                                |
| [`src/css/app.css`](src/css/app.css)                                                         | Global Tailwind entry for the popup.                                                                                                                              |
| [`dist/`](dist/)                                                                             | Built extension package. Load this folder as an unpacked extension. Includes [`dist/manifest.json`](dist/manifest.json) (source of truth for MV3 config in-repo). |
| [`webpack.common.js`](webpack.common.js)                                                     | Entries: `backgroundPage`, `popup`, `contentScript` → `dist/js/[name].js`.                                                                                        |

Path alias: `@src/*` → `src/*` (TypeScript + Webpack + Jest).

## Commands

Prefer **npm** (`package-lock.json` + [`packageManager`](package.json) field). Exact versions are enforced via [`.npmrc`](.npmrc) (`save-exact=true`, `engine-strict=true`).

```bash
nvm use            # or: nvm use $(cat .nvmrc)
npm ci             # preferred when lockfile is trusted
npm install        # only when intentionally changing deps
npm run dev        # webpack watch (development)
npm run build      # production webpack → dist/js only
npm test           # Jest
```

Check-only validation (preferred during reviews):

```bash
npm run typecheck      # tsc --noEmit
npm run lint:check     # ESLint (no --fix)
npm run format:check   # Prettier --check
npm run validate       # typecheck + lint:check + format:check
npm run test:ci        # Jest in CI mode
```

Mutating scripts (use when you intend to fix style):

```bash
npm run lint         # ESLint --fix on src/**/*.ts*
npm run prettify     # Prettier --write on src/**/*.ts*
```

Node / npm: [`.nvmrc`](.nvmrc) → **24.18.0**; `engines` require Node 24.x and npm ≥11. PR CI and release CI read `.nvmrc` and run `npm ci` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml), [`.github/workflows/release-artifacts.yml`](.github/workflows/release-artifacts.yml)). `@types/node` stays on a TypeScript **4.5**-compatible pin until TypeScript itself is upgraded (newer `@types/node` use syntax TS 4.5 cannot parse).

## Architecture (short)

```
Popup (React) ──port "popup"──► Background (service worker)
     │                              │
     │ live: chrome.tabs.sendMessage│ on disconnect: chrome.storage.sync
     ▼                              ▼
Content script ◄── updateStyles / deleteMessages ──  chatgpt.com DOM
     │
     └── injects <style id="custom-style"> + ScrollToTop mount
```

Full flow: [docs/architecture.md](docs/architecture.md). Settings model: [docs/features-and-settings.md](docs/features-and-settings.md). DOM selectors: [docs/dom-integration.md](docs/dom-integration.md).

## Conventions

-   **Language / UI**: TypeScript + React 17. Prefer functional components. Popup views/controls use named implementation files (`MessageEditor.tsx`) plus a barrel `index.ts`; shared UI under `src/components/` uses PascalCase filenames (`FormButtons.tsx`). Tests live under `__tests__/`.
-   **Folder roles**: `src/shared/` = cross-entry domain model, messaging contracts, and pure helpers. `src/lib/utilities/` = Chrome/DOM runtime adapters (storage, selectors, page automation). Do not merge these trees casually.
-   **Styling**: Tailwind utility classes in TSX; CSS modules (`*.module.css`) for component-scoped rules; global styles via `app.css` + PostCSS/Tailwind.
-   **Extension APIs**: Use raw `chrome.*` everywhere (popup, background, content, storage). Do not reintroduce `webextension-polyfill` without an explicit product need.
-   **Lint / format**: ESLint + Prettier ([`.eslintrc.js`](.eslintrc.js), [`.prettierrc.js`](.prettierrc.js)). Prefer check-only commands for validation; `npm run lint` / `npm run prettify` fix/write files.
-   **Tests**: Jest + `react-test-renderer` snapshots under `__tests__/`. Shared Chrome stubs in [`src/setupTests.ts`](src/setupTests.ts). Message shapes live in [`src/shared/messaging/`](src/shared/messaging/).

## Extension constraints (do not ignore)

-   Target host is **`chatgpt.com`** only ([`dist/manifest.json`](dist/manifest.json) `host_permissions` / `content_scripts`).
-   Permissions in use: `activeTab`, `storage`. Avoid new permissions unless product requires them.
-   CSS is applied by writing a **string** into `#custom-style`. Selector drift on ChatGPT’s DOM is the #1 breakage mode.
-   `contentScript` re-applies layout helpers and keeps ScrollToTop mounted on a **1s interval** — null-safe, but still avoid heavier work there.
-   Built JS lands in `dist/js/` (typically gitignored after build); static assets (`manifest.json`, `popup.html`, icons) are **tracked release inputs** under `dist/` and are **not** emitted by Webpack. Never delete tracked static `dist` files; never hand-edit generated `dist/js/*`.

## Change checklists

### Settings shape or defaults

1. Update `Settings` and `defaultSettings` together in [`settings.ts`](src/shared/settings.ts).
2. Extend `buildCss` in [`stylingFunctions.ts`](src/shared/utils/stylingFunctions.ts) for the new field.
3. Wire UI controls (usually MessageEditor sliders/colors or FormButtons).
4. Update tests/snapshots that embed settings objects.
5. Manually verify: load unpacked extension → change value → live preview on chatgpt.com → Save → reload page → style persists.

### Chrome messaging

1. Confirm sender/receiver shapes match the typed contracts in [`src/shared/messaging/`](src/shared/messaging/) (`updateStyles`, `deleteMessages`, port `updateSettings`).
2. Background save-on-disconnect can still race with FormButtons `saveOptionsToStorage` (intentional dual save paths).
3. Live preview uses `sendMessageToTab` → active tab; ensure the active tab is ChatGPT when testing.

### Generated CSS / DOM selectors

1. Prefer editing `buildCss` / fixed CSS fragments in `stylingFunctions.ts` rather than hardcoding CSS in the content script.
2. If ChatGPT’s markup changed, update selectors in content script, styling functions, `deleteAllChats`, `removeUnnecessarySpace`, and `ScrollToTop` together — see [docs/dom-integration.md](docs/dom-integration.md).
3. Verify both light and dark ChatGPT themes when colors are involved.

### Releases

1. Bump version in `package.json`, `package-lock.json` (top-level), and `dist/manifest.json` together — they have drifted historically.
2. Update `CHANGELOG.md`.
3. `npm run build` and smoke-test unpacked `dist/` (build alone does **not** recreate manifest/HTML/icons).
4. Only then create/push a tag; tags run validation then zip artifact upload via GitHub Actions.

## What to avoid

-   Do not restore multi-page HomeMenu/MiscEditor navigation without an explicit product decision; the popup is MessageEditor-only.
-   Do not assume OpenAI will keep `data-testid` / class names stable — document selector changes in the changelog when you fix them.
-   Do not use `npm run lint` / `npm run prettify` as read-only checks.
-   Do not introduce a second package manager lockfile (`yarn.lock`, `pnpm-lock.yaml`); stick to npm.
-   Do not add exploit-style or broad DOM scraping beyond existing feature needs.
-   Do not rewrite the build to a new bundler or broadly upgrade React/Jest/Node without an explicit request.

## Further reading

-   [docs/README.md](docs/README.md) — documentation index
-   [docs/architecture.md](docs/architecture.md)
-   [docs/features-and-settings.md](docs/features-and-settings.md)
-   [docs/development.md](docs/development.md)
-   [docs/dom-integration.md](docs/dom-integration.md)
-   [CONTRIBUTING.md](CONTRIBUTING.md) — human contributor process
