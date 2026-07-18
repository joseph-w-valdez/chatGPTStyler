# ChatGPT Styler — Documentation

Internal documentation for contributors and coding agents. End-user install and marketing copy live in the root [`README.md`](../README.md).

## Quick orientation

ChatGPT Styler is a **Manifest V3 Chromium extension** that:

1. Shows a React **popup** for editing appearance settings.
2. Persists settings in **`chrome.storage.sync`**.
3. Runs a **content script** on `chatgpt.com` that injects CSS, cleans layout classes, mounts a scroll-to-top button, and can automate “delete all chats.”

Primary agent entry point: [`../CLAUDE.md`](../CLAUDE.md).

## Docs in this folder

| Doc | Contents |
|-----|----------|
| [architecture.md](architecture.md) | Entry points, MV3 wiring, module map, messaging & persistence flows, known caveats |
| [features-and-settings.md](features-and-settings.md) | User-facing features, settings model, live preview / save / cancel, CSS generation |
| [development.md](development.md) | Setup, scripts, loading unpacked builds, tests, release CI |
| [dom-integration.md](dom-integration.md) | ChatGPT DOM selectors, class mutations, selector-breakage checklist |

## Source layout (summary)

```
src/
  popup/           # Popup React app
  components/      # Shared UI (also used from content script for ScrollToTop)
  contentScript.ts # Page injection
  backgroundPage.ts# Service worker
  shared/utils/    # Defaults + CSS generation + tab messaging
  lib/utilities/   # Storage, delete-all, layout helpers
dist/              # Packaged extension (manifest, HTML, icons, built JS)
```

## Related root files

- [`package.json`](../package.json) — scripts and dependencies
- [`webpack.common.js`](../webpack.common.js) — bundle entries
- [`dist/manifest.json`](../dist/manifest.json) — extension manifest
- [`CHANGELOG.md`](../CHANGELOG.md) — version history
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — contribution process
