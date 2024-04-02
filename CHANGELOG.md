# Changelog

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
