# CLAUDE.md — ChatGPT Styler

Agent-oriented guide for working in this repository. For deeper detail, see [docs/](docs/README.md).

## What this project is

**ChatGPT Styler** is a Chromium Manifest V3 extension that customizes the ChatGPT UI (`chatgpt.com`). Users adjust message colors, widths, padding, border radius, and input-box width from a React popup. A content script injects generated CSS into the page, mounts a scroll-to-top control, and can drive ChatGPT’s “delete all chats” UI via DOM automation.

- Package name / version: `chatgpt-styler` `1.2.3` ([`package.json`](package.json))
- Store / product context: see [`README.md`](README.md)
- Release history: [`CHANGELOG.md`](CHANGELOG.md)

## Source map

| Path | Role |
|------|------|
| [`src/popup/`](src/popup/) | Extension popup UI (React). Entry: [`src/popup/index.tsx`](src/popup/index.tsx). Root: [`src/popup/component.tsx`](src/popup/component.tsx). |
| [`src/popup/views/messageEditor/`](src/popup/views/messageEditor/) | **Active** settings UI: sliders, color pickers, save/cancel/defaults, delete-all button. |
| [`src/popup/views/homeMenu/`](src/popup/views/homeMenu/), [`src/popup/views/miscEditor/`](src/popup/views/miscEditor/) | **Retained but unused** in the live popup tree (imports exist; not rendered). Prefer not extending these unless restoring multi-page navigation. |
| [`src/contentScript.ts`](src/contentScript.ts) | Injected on `*://chatgpt.com/*`. Loads settings → CSS; listens for style / delete messages; mounts scroll-to-top. |
| [`src/backgroundPage.ts`](src/backgroundPage.ts) | Service worker. Holds in-memory settings from the popup port; persists on popup disconnect. |
| [`src/shared/utils/stylingFunctions.ts`](src/shared/utils/stylingFunctions.ts) | Settings → CSS string; `sendMessageToTab` for live preview. |
| [`src/shared/utils/data.ts`](src/shared/utils/data.ts) | `defaultSettings`. |
| [`src/lib/utilities/googleStorage.ts`](src/lib/utilities/googleStorage.ts) | `SettingsType`, `getOptionsFromStorage`, `saveOptionsToStorage` (`chrome.storage.sync`). |
| [`src/lib/utilities/deleteAllChats.ts`](src/lib/utilities/deleteAllChats.ts) | DOM automation for delete-all. |
| [`src/lib/utilities/removeUnnecessarySpace.ts`](src/lib/utilities/removeUnnecessarySpace.ts) | Strips ChatGPT layout classes that fight custom widths. |
| [`src/components/`](src/components/) | Shared UI: Header, FormButtons, DeleteAllChatsButton, ScrollToTop, HomeButton. |
| [`src/css/app.css`](src/css/app.css) | Global Tailwind entry for the popup. |
| [`dist/`](dist/) | Built extension package. Load this folder as an unpacked extension. Includes [`dist/manifest.json`](dist/manifest.json) (source of truth for MV3 config in-repo). |
| [`webpack.common.js`](webpack.common.js) | Entries: `backgroundPage`, `popup`, `contentScript` → `dist/js/[name].js`. |

Path alias: `@src/*` → `src/*` (TypeScript + Webpack + Jest).

## Commands

Prefer **npm** (CI and `package-lock.json` are authoritative; `yarn.lock` also exists — avoid editing both unless intentionally standardizing).

```bash
npm install          # setup
npm run dev          # webpack watch (development)
npm run build        # production webpack → dist/js only
npm test             # Jest
npm run storybook    # Storybook on :6006
```

Check-only validation (preferred during reviews — the package scripts below **mutate**):

```bash
npx eslint -c ./.eslintrc.js "src/**/*.ts*"
npx prettier --check "src/**/*.ts*"
npx tsc --noEmit
```

Mutating scripts (use when you intend to fix style):

```bash
npm run lint         # ESLint --fix on src/**/*.ts*
npm run prettify     # Prettier --write on src/**/*.ts*
```

Node version hint: [`.nvmrc`](.nvmrc) → `16.13.0`. CI release workflow currently uses Node 14 ([`.github/workflows/release-artifacts.yml`](.github/workflows/release-artifacts.yml)).

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

- **Language / UI**: TypeScript + React 17. Prefer functional components and existing folder layout (`component.tsx` + `index.tsx` + `__tests__` / `stories`).
- **Styling**: Tailwind utility classes in TSX; CSS modules (`*.module.css`) for component-scoped rules; global styles via `app.css` + PostCSS/Tailwind.
- **Extension APIs**: Prefer patterns already in the file you touch. Popup uses `webextension-polyfill` in places; content/background/storage often use raw `chrome.*`. Do not “clean up” APIs across the codebase unless asked.
- **Lint / format**: ESLint + Prettier ([`.eslintrc.js`](.eslintrc.js), [`.prettierrc.js`](.prettierrc.js)). Prefer check-only commands for validation; `npm run lint` / `npm run prettify` fix/write files.
- **Tests**: Jest + `react-test-renderer` / Enzyme snapshots under `__tests__` / `__test__`. Mock `webextension-polyfill` via [`src/__mocks__/webextension-polyfill.ts`](src/__mocks__/webextension-polyfill.ts). Stories are ignored by Jest (`stories.tsx`). Some suites are currently broken (Enzyme adapter missing, incomplete polyfill mock); see [docs/development.md](docs/development.md).
- **Storybook**: Colocate `*.stories.tsx`; polyfill is mocked in [`.storybook/main.js`](.storybook/main.js). Dependency majors are mixed (6.x / 7.x) — avoid casual Storybook upgrades.

## Extension constraints (do not ignore)

- Target host is **`chatgpt.com`** only ([`dist/manifest.json`](dist/manifest.json) `host_permissions` / `content_scripts`).
- Permissions in use: `activeTab`, `storage`. Avoid new permissions unless product requires them.
- CSS is applied by writing a **string** into `#custom-style`. Selector drift on ChatGPT’s DOM is the #1 breakage mode.
- `contentScript` remounts / re-applies layout helpers on a **1s interval** — be careful adding heavier work there.
- Built JS lands in `dist/js/` (typically gitignored after build); static assets (`manifest.json`, `popup.html`, icons) are **tracked release inputs** under `dist/` and are **not** emitted by Webpack. Never delete tracked static `dist` files; never hand-edit generated `dist/js/*`.

## Change checklists

### Settings shape or defaults

1. Update `SettingsType` in [`googleStorage.ts`](src/lib/utilities/googleStorage.ts).
2. Update `defaultSettings` in [`data.ts`](src/shared/utils/data.ts).
3. Add / adjust a `settingsController` entry and concatenation in [`stylingFunctions.ts`](src/shared/utils/stylingFunctions.ts).
4. Wire UI controls (usually MessageEditor sliders/colors or FormButtons).
5. Update tests/snapshots/stories that embed settings objects.
6. Manually verify: load unpacked extension → change value → live preview on chatgpt.com → Save → reload page → style persists.

### Chrome messaging

1. Confirm sender/receiver action names match (`updateStyles`, `deleteMessages`, port `updateSettings`, etc.).
2. Note caveats in [docs/architecture.md](docs/architecture.md): `SETTINGS_CHANGED` from storage is **not** handled by the content script; background save-on-disconnect can race with FormButtons `saveOptionsToStorage`.
3. Live preview uses `sendMessageToTab` → active tab; ensure the active tab is ChatGPT when testing.

### Generated CSS / DOM selectors

1. Prefer editing `settingsController` / fixed CSS fragments in `stylingFunctions.ts` rather than hardcoding CSS in the content script.
2. If ChatGPT’s markup changed, update selectors in content script, styling functions, `deleteAllChats`, `removeUnnecessarySpace`, and `ScrollToTop` together — see [docs/dom-integration.md](docs/dom-integration.md).
3. Verify both light and dark ChatGPT themes when colors are involved.

### Releases

1. Bump version in `package.json`, `package-lock.json` (top-level), and `dist/manifest.json` together — they have drifted historically.
2. Update `CHANGELOG.md`.
3. `npm run build` and smoke-test unpacked `dist/` (build alone does **not** recreate manifest/HTML/icons).
4. Only then create/push a tag; tags trigger zip artifact upload via GitHub Actions (no PR test CI today).

## What to avoid

- Do not treat `HomeMenu` / `MiscEditor` as the current UX; the popup renders **MessageEditor** directly.
- Do not assume OpenAI will keep `data-testid` / class names stable — document selector changes in the changelog when you fix them.
- Do not use `npm run lint` / `npm run prettify` as read-only checks.
- Do not edit `yarn.lock` unless deliberately changing package-manager policy; prefer npm.
- Do not add exploit-style or broad DOM scraping beyond existing feature needs.
- Do not rewrite the build to a new bundler or broadly upgrade React/Jest/Storybook/Node without an explicit request.

## Further reading

- [docs/README.md](docs/README.md) — documentation index
- [docs/architecture.md](docs/architecture.md)
- [docs/features-and-settings.md](docs/features-and-settings.md)
- [docs/development.md](docs/development.md)
- [docs/dom-integration.md](docs/dom-integration.md)
- [CONTRIBUTING.md](CONTRIBUTING.md) — human contributor process
