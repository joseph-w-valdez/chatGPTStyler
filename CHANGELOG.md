# Changelog

## [1.3.2] - 2026-07-19

### Fixed

-   Message width now resizes user text bubbles by setting an explicit width from ChatGPT’s `--user-chat-width` layout variable, so user and assistant messages scale together

### Added

-   Background settings tab with opt-in conversation and sidebar surface colors, plus a sync mode that collapses both into one App Background picker
-   Misc settings tab containing delete-all and an enabled-by-default toggle for the scroll-to-top button
-   System, Light, and Dark popup appearance options in the Misc tab
-   Tab-aware Restore Defaults behavior that resets only the active settings section

## [1.3.1] - 2026-07-18

### Fixed

-   Cancel now restores the last saved settings instead of built-in defaults
-   Prevented a race where closing the popup before settings finished loading could overwrite saved options with defaults
-   Merged stored settings with defaults so missing keys from older installs are filled in
-   Prevented content-script console errors when ChatGPT layout nodes are missing
-   Restored message colors, padding, radius, and widths against the current ChatGPT turn markup (`data-turn` / role attributes)
-   Removed ChatGPT’s shared content-width cap so message and input-box width sliders can reach 100%
-   Restored delete-all for the current Profile → Settings → Data controls flow, with reliable success/failure reporting
-   Restored scroll-to-top on ChatGPT’s real scroll root and placed it beside the native scroll-to-bottom control
-   Restored the color controls' original visual layout while preserving their accessible names
-   Restored popup button backgrounds after `type="button"` lost to Tailwind preflight specificity

### Changed

-   Made CSS generation deterministic by building styles from the complete settings object
-   Added regression coverage for generated CSS
-   Hardened the content-script 1s integration loop to skip missing DOM and avoid stale mounts
-   Removed an unused content-script handshake message
-   Delete-all now awaits the content-script result and uses a hostname-based ChatGPT tab check
-   Removed unused HomeMenu / MiscEditor / HomeButton multi-page shell; popup is MessageEditor-only
-   Redesigned the popup with semantic light/dark theme tokens that follow the operating-system color preference
-   Modernized slider, color-card, action-button, and delete-all styling while retaining the existing live-preview and save/cancel behavior
-   Added a compact popup header using the existing extension icon and a theme-aware close control
-   Improved disabled action states so controls remain visible instead of disappearing
-   Standardized extension messaging on typed `chrome.*` contracts; removed `webextension-polyfill`
-   Removed unused popup handshakes and the unused `SETTINGS_CHANGED` storage broadcast
-   Hardened live-preview tab messaging against missing tabs / `runtime.lastError`
-   Fixed popup mount so React waits for `#popup` (script no longer races ahead of the DOM)
-   Colocated the `Settings` model and defaults; renamed the Chrome storage adapter for clearer ownership
-   Storage reads and writes now keep only known settings keys
-   Standardized popup prop naming on `liveSettings` / `setLiveSettings`
-   Renamed popup views to named files (`Popup`, `MessageEditor`, `ColorControls`, `MessageSliderControls`)
-   Renamed `colorControl` → `colorControls` and `scrollToTop.tsx` → `ScrollToTop.tsx`
-   Standardized test folders on `__tests__`; removed unused MessageEditor CSS and Tailwind tokens
-   Improved popup control labeling and delete-all status announcements for assistive tech
-   Stopped logging user settings and other noisy console messages in production paths
-   Upgraded TypeScript to 4.9.5 and aligned `@types/node` to 24.x; bumped `ts-loader` for compatibility
-   Upgraded Jest to 29.7 with matching `ts-jest`, `@types/jest`, and `jest-environment-jsdom`
-   Replaced `jest-css-modules` with `identity-obj-proxy` for CSS module mocks
-   Upgraded React and ReactDOM to 18.3; migrated popup and content-script mounts to `createRoot`
-   Added a development-only ChatGPT selector health check with copyable JSON results; probes track the current DOM
-   Added explicit `build:dev` / `build:prod` flavors driven by one mode-aware Webpack config; production strips debug console calls
-   Added concurrent development/production CI builds and automated tagged GitHub Releases with separate production and debugging artifacts; RC tags publish as pre-releases

### Removed

-   Removed the unused message-button visibility setting because ChatGPT now always displays message actions and the extension no longer provides a control for it
-   Removed obsolete ChatGPT CSS helpers that no longer match the current DOM (legacy message-surface classes and old presentation-chain layout resets)

## [1.3.0] - 2025-10-17

### Changed

-   Published the existing 1.2.3 build under the 1.3.0 release tag; no additional code changes were included and the packaged version metadata remained 1.2.3

## [1.2.3] - 2025-06-25

### Fixed

-   Fixed leaking text color in non-nmessage elements in light mode
-   Fixed submit button svg color in light mode

## [1.2.2] - 2025-05-16

### Fixed

-   Fixed chat message colors being switched
-   Fixed chat colors from not working
-   Input box now takes up the full container width
-   Removed unecessary white space from user message bubbles

## [1.2.1] - 2025-02-19

### Fixed

-   Fixed checking active tab's URL
-   Fixed chatHistory querySelect not targetting the correct div element

## [1.1.2] - 2025-01-29

### Fixed

-   Fixed selector to append button to proper element.

## [1.1.1] - 2024-11-25

### Added

-   Restored `dist` files:
    -   `manifest.json`
    -   `popup.html`
    -   `comparison.png`
    -   `icon-16.png`
    -   `icon-48.png`
    -   `icon-128.png`

## [1.1.0] - 2024-11-24

### Changed

-   Fixed broken media queries for the user text colors
-   Removed home menu and misc page references so that the default view is the message editor
-   Added extra default message styling to revert to original ChatGPT Styler css
-   Updated default input box message width from 70% to 94%

## [1.0.2] - 2024-05-07

### Changed

-   Updated `manifest.json` values from `chat.openai.com` to `chatgpt.com`

## [1.0.1] - 2024-04-02

### Added

-   Added Scroll To Top Button functionality
-   Updated README file

## [1.0.0] - 2024-04-01

### Added

-   Updated popup to be able to update and save settings.
-   Popup saves settings when closed.
-   Popup sends message to content script for live changes.

## [0.1.5] - 2024-02-12

### Added

-   Added CSS to code snippet parent to fix width.

## [0.1.4] - 2024-02-08

### Added

-   Added CSS to light and dark mode default values for editing textarea background color.

### Changed

-   No changes in this release.

### Fixed

-   No bug fixes in this release.

## [0.1.3] - 2024-02-02

### Added

-   Implemented functionality for chat container to scroll to bottom when a new message is sent

### Changed

-   No changes in this release.

### Fixed

-   No bug fixes in this release.

## [0.1.2] - 2024-01-30

### Added

-   Added CSS to chat message buttons to unset visibility.

## [0.1.1] - 2024-01-17

### Added

-   Added function to reset message colors to default.

### Changed

-   updateMessageColor function now has another parameter for dark mode.

### Fixed

-   No bug fixes in this release.

## [0.1.1] - 2024-01-17

### Added

-   Added function to reset message colors to default.

### Changed

-   updateMessageColor function now has another parameter for dark mode.

### Fixed

-   No bug fixes in this release.

## [0.1.0] - 2024-01-13

### Added

-   Implemented basic content script functionality:
    -   Enabled changing the background color of the page (commented out for now).
    -   Created a custom style element and attached it to the `head` element.
    -   Added functions to update various styles dynamically:
        -   `updateMessageMaxWidth(widthPercentage: number)`: Updates the maximum width of messages.
        -   `updateMessageColor(color: string, isUser: boolean)`: Updates the background color of messages based on user or non-user messages.
        -   `updateMessagePadding(padding: string)`: Updates the padding of messages.
        -   `updateMessageBorderRadius(borderRadius: string)`: Updates the border radius of messages.
        -   `updateInputBoxMaxWidth(widthPercentage: number)`: Updates the maximum width of the input box.
    -   Created `setDefaultSettings()` function to set default styles on script load.
