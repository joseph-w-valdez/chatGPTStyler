# Changelog

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
