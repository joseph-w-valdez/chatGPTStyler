# DOM Integration

ChatGPT Styler depends heavily on ChatGPT’s page structure. When OpenAI changes markup, styles, delete-all, layout cleanup, or scroll-to-top can break independently. This doc catalogs selectors and how to verify fixes.

## Why this is fragile

-   Content script CSS targets deep, often nth-child-based selectors.
-   Delete-all **clicks through ChatGPT’s own UI** rather than calling an official API.
-   Layout helpers **remove site classes** by name (`max-w-(--thread-content-max-width)`, `items-end`, etc.).
-   Remount / cleanup runs on a **1-second interval**. Missing nodes are skipped (no throw). Broken selectors may still fail quietly until you inspect the page.

Always prefer updating selectors in the smallest surface that broke, then smoke-test light + dark themes.

## Files that touch the DOM

| File                                                                                            | Responsibility                                            |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`src/contentScript.ts`](../src/contentScript.ts)                                               | Style tag, message listeners, null-safe mount/layout loop |
| [`src/lib/utilities/chatDom.ts`](../src/lib/utilities/chatDom.ts)                               | Shared ChatGPT DOM selectors / mount ids                  |
| [`src/shared/utils/stylingFunctions.ts`](../src/shared/utils/stylingFunctions.ts)               | CSS selectors for conversation turns, form, composer      |
| [`src/lib/utilities/removeUnnecessarySpace.ts`](../src/lib/utilities/removeUnnecessarySpace.ts) | ClassList removals on message / input containers          |
| [`src/lib/utilities/deleteAllChats.ts`](../src/lib/utilities/deleteAllChats.ts)                 | Profile → Settings → delete-all automation                |
| [`src/components/scrollToTop/ScrollToTop.tsx`](../src/components/scrollToTop/ScrollToTop.tsx)   | Scroll container + injected button                        |

## Selector catalog

### Content script mount & layout ([`contentScript.ts`](../src/contentScript.ts) / [`chatDom.ts`](../src/lib/utilities/chatDom.ts))

| Purpose              | Selector / target                                                                  |
| -------------------- | ---------------------------------------------------------------------------------- |
| Style injection      | `#custom-style` created under `document.head`                                      |
| User text containers | `[data-message-author-role="user"]`                                            |
| Input box container  | `#thread-bottom > * > div`                                                     |
| Scroll-to-top parent | `[data-scroll-root]`                                                           |
| Scroll-to-top mount host | `#thread-bottom-container [style*="--thread-scroll-to-bottom-banner-offset"]` |
| Mount node id        | `#scroll-to-top-mount`                                                         |

### Generated CSS root ([`stylingFunctions.ts`](../src/shared/utils/stylingFunctions.ts))

| Purpose                              | Selector pattern                                                          |
| ------------------------------------ | ------------------------------------------------------------------------- |
| All message turns                    | `[data-testid^="conversation-turn-"]` (variable `messageBubbles`)         |
| User bubble background / text / radius / padding / width | `[data-turn="user"] .user-message-bubble-color` |
| Assistant message background / padding / width / radius | `[data-turn="assistant"] [data-message-author-role="assistant"]` |
| Assistant text color                 | `[data-turn="assistant"]` nested `p`, lists, code, headings               |
| Input form width                     | `form`                                                                    |
| Content width cap removal            | `[data-conversation-screenshot-content]`, `#thread-bottom > div > div > div > div` |
| Code / composer helpers              | nth-child(2) under bubbles; `#composer-submit-button`                     |

Turns are role-tagged via `data-turn="user"|"assistant"` (not odd/even sibling index). Odd/even broke after ChatGPT wrapped each turn in `data-turn-id-container`.

### Layout class removals ([`removeUnnecessarySpace.ts`](../src/lib/utilities/removeUnnecessarySpace.ts))

**On input box container:**

-   `max-w-(--thread-content-max-width)`
-   `gap-4`, `md:gap-5`, `lg:gap-6`

**On each user text container:**

-   `items-end`
-   First child: `px-5`

If ChatGPT renames these utilities, cleanup becomes a no-op and widths may look constrained again.

### Scroll to top ([`ScrollToTop.tsx`](../src/components/scrollToTop/ScrollToTop.tsx))

| Purpose            | Selector / behavior                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Scroll parent      | `[data-scroll-root]`                                                                              |
| Mount host         | `#thread-bottom-container` control area (beside native scroll-to-bottom)                          |
| Injected button id | `#scroll-to-top-btn`                                                                              |

Uses ChatGPT page token/button classes plus known absolute positioning so the control sits beside the native scroll-to-bottom button.

### Delete all chats ([`deleteAllChats.ts`](../src/lib/utilities/deleteAllChats.ts))

Comments in source note that selectors may need updates after domain HTML changes.

| Step                   | Selector / action                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Detect history present | `#history a[href^="/c/"]` (at least one conversation link)                         |
| Open profile           | Visible (non-`inert`) `[data-testid="accounts-profile-button"]` via pointer events |
| Open settings          | `[data-testid="settings-menu-item"]` click                                         |
| Open Data controls     | `[data-testid="data-controls-tab"]` click                                          |
| Delete all             | `button.btn-danger-outline[aria-label^="Delete all"]` (awaited)                    |
| Confirm                | `[data-testid="confirm-delete-all-chats-button"]` (awaited)                        |

Popup gate: active tab hostname is `chatgpt.com` / `*.chatgpt.com` ([`DeleteAllChatsButton.tsx`](../src/components/deleteAllChatsButton/DeleteAllChatsButton.tsx)). Automation uses bounded waits and always clears timers; SUCCESS is only returned after the confirm click.

## Message contracts that affect the page

| Message                                   | Direction  | Content script effect                                               |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `{ action: "updateStyles", arg: string }` | Popup → CS | Replace `#custom-style` text                                        |
| `{ action: "deleteMessages" }`            | Popup → CS | Run async `deleteAllChats()`; respond SUCCESS/FAILURE when finished |

Typed contracts live in [`src/shared/messaging/`](../src/shared/messaging/). On load, CS still applies styles from `getOptionsFromStorage` → `buildCss(settings)`.

## Selector-update verification checklist

Use this after ChatGPT UI changes or when touching any file above.

0. **Dev probe (optional)** — `npm run build:dev` or `npm run dev`, reload the extension, open a chatgpt.com chat, click **Check ChatGPT Selectors** in the popup. Required probes should be ok; optional ones may be 0 until menus are open.
1. **Build & reload** — `npm run build:prod` / `npm run build` (or a development flavor); reload extension; hard-refresh chatgpt.com.
2. **Styles on load** — With saved settings, confirm bubble colors, widths, padding, radius, and input width apply without opening the popup.
3. **Live preview** — Focus the ChatGPT tab, open the popup, drag sliders / change colors; page should update immediately.
4. **Odd/even correctness** — User messages vs assistant messages must not be color-swapped; check a multi-turn thread.
5. **Light + dark** — Switch ChatGPT theme; check text contrast, submit button (`#composer-submit-button`), and edit textarea backgrounds.
6. **Layout cleanup** — User bubbles should not be overly right-constrained; input should use available width.
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
