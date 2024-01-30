# Changelog

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

### Changed

-   No changes in this release.

### Fixed

-   No bug fixes in this release.
