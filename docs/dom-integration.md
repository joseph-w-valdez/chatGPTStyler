# DOM Integration

ChatGPT Styler depends heavily on ChatGPT’s page structure. When OpenAI changes markup, styles, delete-all, or scroll-to-top can break independently. This doc catalogs selectors and how to verify fixes.

## Why this is fragile

-   Content script CSS targets deep, often nth-child-based selectors.
-   Delete-all **clicks through ChatGPT’s own UI** rather than calling an official API.
-   Width overrides fight ChatGPT's own width caps, which it moves between elements across redesigns.
-   Remounting runs on a **1-second interval**. Missing nodes are skipped (no throw). Broken selectors may still fail quietly until you inspect the page.

Always prefer updating selectors in the smallest surface that broke, then smoke-test light + dark themes.

## Files that touch the DOM

| File                                                                                          | Responsibility                                                          |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`src/contentScript.ts`](../src/contentScript.ts)                                             | Style tag, message listeners, null-safe mount loop                      |
| [`src/shared/selectors.ts`](../src/shared/selectors.ts)                                       | **Registry of every ChatGPT selector** (label, default, expected count) |
| [`src/lib/utilities/activeSelectors.ts`](../src/lib/utilities/activeSelectors.ts)             | Active selectors: dev overrides, then repairs, then registry variants   |
| [`src/lib/utilities/selectorDiscovery.ts`](../src/lib/utilities/selectorDiscovery.ts)         | Heuristic finders and ranked replacement candidates                     |
| [`src/lib/utilities/selectorTesting.ts`](../src/lib/utilities/selectorTesting.ts)             | Count, coverage, visibility, and live effect checks for a selector      |
| [`src/lib/utilities/selectorRepair.ts`](../src/lib/utilities/selectorRepair.ts)               | Repair layout: heals broken keys and persists the passing repairs       |
| [`src/lib/utilities/selectorExport.ts`](../src/lib/utilities/selectorExport.ts)               | Dev-only JSON of the working selectors plus a registry patch            |
| [`src/lib/utilities/chatDom.ts`](../src/lib/utilities/chatDom.ts)                             | Scroll-to-top mount id and button styling                               |
| [`src/shared/utils/stylingFunctions.ts`](../src/shared/utils/stylingFunctions.ts)             | Generated CSS built from the registry selectors                         |
| [`src/lib/utilities/deleteAllChats.ts`](../src/lib/utilities/deleteAllChats.ts)               | Profile → Settings → delete-all automation                              |
| [`src/components/scrollToTop/ScrollToTop.tsx`](../src/components/scrollToTop/ScrollToTop.tsx) | Scroll container + injected button                                      |

## Selector catalog

All ChatGPT selectors live in [`src/shared/selectors.ts`](../src/shared/selectors.ts); generated CSS, the content script, delete-all, scroll-to-top, and the selector tools all read from it. The tables below list the current app-shell defaults (Oct 2026) and the earlier-layout variants kept as fallbacks; the registry is the source of truth.

Self-healing, in order of precedence:

1. **Fallback chains.** Each entry has a `defaultSelector` for the current layout and `fallbacks` from earlier layouts. CSS uses the union of all variants; single-element lookups (`queryActive`) try them in order. When ChatGPT changes markup, move the old default into `fallbacks` instead of deleting it.
2. **Repair layout** (popup dev tools, development builds only; production runs only the registry's reviewed selectors). Runs the heuristic finders on the live page, tries each broken selector's suggestions in rank order, and keeps one only if it passes a dry run and then the live effect and visibility checks once applied. Repairs are stored in `chrome.storage.local` (`healedSelectors`), tried before the registry variants, and cleared by **Undo repairs** or by a later repair run where the built-ins work again.
3. **Dev overrides** from the [selector workbench](development.md#dev-only-selector-inspector) replace an entry outright, for isolated testing.

To fix a selector permanently, run **Repair & export selectors** (dev build) and paste its `registryPatch` entries into the registry: each one already makes the working selector the `defaultSelector` and keeps the old variants in `fallbacks`. The workbench's [repair drill](development.md#repair-drill-simulated-breaks) checks that Repair can recover a key before ChatGPT actually breaks it.

### Content script mount & layout ([`contentScript.ts`](../src/contentScript.ts) / [`chatDom.ts`](../src/lib/utilities/chatDom.ts))

| Purpose                  | Registry key        | Current default                                      | Fallbacks                                                                     |
| ------------------------ | ------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Style injection          | n/a                 | `#custom-style` created under `document.head`        |                                                                               |
| Scroll-to-top parent     | `scrollRoot`        | `[data-app-action-timeline-scroll]`                  | `[data-scroll-root]`                                                          |
| Scroll-to-top mount host | `scrollControlHost` | `div:has(> button[class~="group/scroll-to-bottom"])` | `#thread-bottom-container [style*="--thread-scroll-to-bottom-banner-offset"]` |
| Mount node id            | n/a                 | `#scroll-to-top-mount`                               |                                                                               |

### Generated CSS root ([`stylingFunctions.ts`](../src/shared/utils/stylingFunctions.ts))

| Purpose                                          | Registry key          | Current default                                                                | Fallbacks                                                                    |
| ------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| All message turns (edit box)                     | `messageTurn`         | `[data-turn-key]`                                                              | `[data-testid^="conversation-turn-"]`                                        |
| User message width (`--user-chat-width`)         | `userTurn`            | `[data-chatgpt-search-unit-key$=":user"]`                                      | `[data-turn="user"]`                                                         |
| Assistant text color                             | `assistantTurn`       | `[data-chatgpt-search-unit-key$=":assistant"]`                                 | `[data-turn="assistant"]`                                                    |
| User bubble background / text / radius / padding | `userBubble`          | `[data-user-message-bubble]`                                                   | `[data-turn="user"] .user-message-bubble-color`                              |
| Assistant message background / padding / width   | `assistantMessage`    | `[data-markdown-text-style="assistant-message"]`                               | `[data-turn="assistant"] [data-message-author-role="assistant"]`             |
| Content width cap removal                        | `turnContentWidthCap` | `[data-thread-user-message-navigation-content]`                                | `[data-testid^="conversation-turn-"] [data-conversation-screenshot-content]` |
| Composer width cap removal                       | `composerWidthCap`    | `[data-pip-obstacle="thread-footer"]`                                          | `#thread-bottom > div > div > div > div`                                     |
| Input form width                                 | `composerForm`        | `[data-chatgpt-composer]`                                                      | `form`                                                                       |
| Submit icon in light mode                        | `composerSubmit`      | `#composer-submit-button`                                                      |                                                                              |
| Conversation surface (opt-in)                    | `conversationMain`    | `main` (sets `--color-surface`), plus `--main-surface-primary` on theme scopes |                                                                              |
| Sidebar surface (opt-in)                         | `sidebarSurface`      | `.app-shell-left-panel, #app-shell-sidebar > .bg-surface`                      | `.bg-token-sidebar-surface-primary`, `.bg-\(--sidebar-surface-primary\)`     |
| Background image layer (opt-in)                  | n/a                   | `#chatgpt-styler-bg-layer` + inner `.chatgpt-styler-bg-image` (injected)       |                                                                              |
| Scroll-to-top visibility                         | n/a                   | `#scroll-to-top-btn` (`display: none` when disabled)                           |                                                                              |

On the app-shell layout one `[data-turn-key]` turn wraps a whole exchange, so role styling uses the role-suffixed search-unit keys rather than the turn itself. Never match roles by odd/even sibling index. The one fixed child-path rule (content column width under each turn) is pinned to the pre-app-shell `[data-testid^="conversation-turn-"]` turns, because on the app-shell layout the same path lands on each exchange's content blocks.

User image wrappers consume ChatGPT's `--user-chat-width` custom property as their width, while text bubbles use it only as a native maximum. The extension therefore sets the variable on the user turn and applies it as the explicit width of the user bubble. Do not constrain the full-width row around the bubble.

The composer form sits in a flex column, so the generated CSS sets `width: 100%` alongside the Input Box Width `max-width`; with only `margin: auto`, the form would shrink to its content and ignore the slider.

Background surface overrides are emitted only when `customBackgroundsEnabled` is true. Sync mode uses `syncedBackgroundStyle` for both conversation and sidebar; unsynced mode uses the retained separate values. When a background image is also enabled, the conversation/app color is painted on the injected layer _under_ the image (so it shows through PNG transparency and the opacity slider), while ChatGPT’s `--main-surface-primary` is forced transparent so it does not cover the layer. The sidebar color still applies normally.

Background image (opt-in via `backgroundImageEnabled`): the content script injects `#chatgpt-styler-bg-layer` (absolute, `pointer-events:none`, first child) into the scrollport's non-scrolling parent — the `scrollRoot` match's `parentElement`, falling back to `conversationMain` — so it is bounded to the conversation column and stays fixed while the thread scrolls. The host is set `position: relative` if static. `buildCss` forces `--main-surface-primary` and the conversation column's `--color-surface` transparent so the layer shows, sets the layer base color from the conversation/app color when customization is on, and sets the inner `.chatgpt-styler-bg-image` opacity. The image data URL lives in `chrome.storage.local` and is applied to the inner element by the content script (kept out of the CSS string). If ChatGPT changes its scroll/main structure, re-verify the host and that the transparent surfaces still reveal the layer.

### Scroll to top ([`ScrollToTop.tsx`](../src/components/scrollToTop/ScrollToTop.tsx))

| Purpose            | Selector / behavior                                                             |
| ------------------ | ------------------------------------------------------------------------------- |
| Scroll parent      | `scrollRoot` registry key                                                       |
| Mount host         | `scrollControlHost` registry key (wrapper of the native scroll-to-bottom arrow) |
| Injected button id | `#scroll-to-top-btn`                                                            |

Uses ChatGPT page token/button classes plus known absolute positioning so the control sits beside the native scroll-to-bottom button.

The button remains mounted for lightweight lifecycle stability; disabling `scrollToTopEnabled` hides it through generated CSS, so live preview and persisted settings use the existing style-update path.

### Delete all chats ([`deleteAllChats.ts`](../src/lib/utilities/deleteAllChats.ts))

The menu and dialog steps have not been re-verified on the app-shell layout; open each one and use **Pick element** (Alt+Shift+P) to confirm.

| Step                   | Registry key          | Current default                                                                                                                        |
| ---------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Detect history present | `chatHistory`         | `[data-sidebar-chatgpt-conversation-key] a[href*="/c/"]` (fallback `#history a[href^="/c/"]`)                                          |
| Open profile           | `profileButton`       | Visible (non-`inert`) `button[aria-label="Open profile menu"]` via pointer events (fallback `[data-testid="accounts-profile-button"]`) |
| Open settings          | `settingsMenuItem`    | `[data-testid="settings-menu-item"]` click                                                                                             |
| Open Data controls     | `dataControlsTab`     | `[data-testid="data-controls-tab"]` in the open dialog                                                                                 |
| Delete all             | `deleteAllButton`     | `button.btn-danger-outline[aria-label^="Delete all"]` in the open dialog (awaited)                                                     |
| Confirm                | `confirmDeleteButton` | `[data-testid="confirm-delete-all-chats-button"]` in the open dialog (awaited)                                                         |

Popup gate: active tab hostname is `chatgpt.com` / `*.chatgpt.com` ([`DeleteAllChatsButton.tsx`](../src/components/deleteAllChatsButton/DeleteAllChatsButton.tsx)). Automation uses bounded waits and always clears timers; SUCCESS is only returned after the confirm click.

## Message contracts that affect the page

| Message                                                        | Direction  | Content script effect                                               |
| -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `{ action: "updateStyles", settings: Settings }`               | Popup → CS | Rebuild `#custom-style` from settings + active selectors            |
| `{ action: "updateBackgroundImage", dataUrl: string \| null }` | Popup → CS | Set/clear the injected background-image layer's source              |
| `{ action: "deleteMessages" }`                                 | Popup → CS | Run async `deleteAllChats()`; respond SUCCESS/FAILURE when finished |

Typed contracts live in [`src/shared/messaging/`](../src/shared/messaging/). On load, CS still applies styles from `getOptionsFromStorage` → `buildCss(settings)`.

## Selector-update verification checklist

Use this after ChatGPT UI changes or when touching any file above.

0. **Dev probe (optional)** — `npm run build:dev` or `npm run dev`, reload the extension, open a chatgpt.com chat, click **Repair & export selectors** in the popup. `broken` should be empty; `notOnPage` entries are fine until their menu or dialog is open. For anything broken or in `needsReview`, run **Audit on page** (or Alt+Shift+A) for ranked replacements, or **Pick element** (Alt+Shift+P) and click the element — see [development.md](development.md#dev-only-selector-inspector).
1. **Build & reload** — `npm run build:prod` / `npm run build` (or a development flavor); reload extension; hard-refresh chatgpt.com.
2. **Styles on load** — With saved settings, confirm bubble colors, widths, padding, radius, and input width apply without opening the popup.
3. **Live preview** — Focus the ChatGPT tab, open the popup, drag sliders / change colors; page should update immediately.
4. **Role correctness** — User messages vs assistant messages must not be color-swapped; check a multi-turn thread.
5. **Light + dark** — Switch ChatGPT theme; check text contrast, submit button (`#composer-submit-button`), and edit textarea backgrounds.
6. **Widths** — Message Width and Input Box Width sliders should both visibly widen and narrow; user bubbles stay right-aligned.
7. **Scroll to top** — Scroll down in a long thread; button appears; click returns to top; navigating to another chat still shows the button when scrolled.
8. **Delete all (careful)** — Only on a throwaway account / empty-safe session. Confirm confirmation UI still appears and completes, or fails gracefully with “No chat history found” when empty.
9. **SPA navigation** — Switch conversations and start a new chat; styles and scroll button should still work (interval remount).
10. **Changelog** — Document selector fixes under Fixed in [`CHANGELOG.md`](../CHANGELOG.md).

## Debugging tips

-   In DevTools on chatgpt.com, inspect `#custom-style` — its text content is the exact CSS the extension applied.
-   Log lines: content script prints `"Content script loaded."`; delete path logs popup ↔ CS messages.
-   If live preview “does nothing,” confirm the **active** tab is ChatGPT (popup messaging targets the active tab only).
-   If Save works after reload but not live, check `sendMessageToTab` / content-script listener; if live works but reload loses styles, check `chrome.storage.sync` `options` and background disconnect save.

## Related docs

-   [architecture.md](architecture.md)
-   [features-and-settings.md](features-and-settings.md)
-   [development.md](development.md)
-   [../CLAUDE.md](../CLAUDE.md)
