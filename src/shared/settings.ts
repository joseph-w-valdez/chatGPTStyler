export interface Settings {
    messageMaxWidthStyle: string;
    messageColorUserStyle: string;
    messageColorNonUserStyle: string;
    messagePaddingStyle: string;
    messageBorderRadiusStyle: string;
    inputBoxMaxWidthStyle: string;
    textColorUserStyle: string;
    textColorNonUserStyle: string;
    customBackgroundsEnabled: boolean;
    syncBackgroundColors: boolean;
    conversationBackgroundStyle: string;
    sidebarBackgroundStyle: string;
    syncedBackgroundStyle: string;
    scrollToTopEnabled: boolean;
}

export const defaultSettings: Settings = {
    messageMaxWidthStyle: "95",
    messageColorUserStyle: "#0084FF",
    messageColorNonUserStyle: "#333333",
    messagePaddingStyle: "10",
    messageBorderRadiusStyle: "5",
    inputBoxMaxWidthStyle: "94",
    textColorUserStyle: "#FFFFFF",
    textColorNonUserStyle: "#FFFFFF",
    customBackgroundsEnabled: false,
    syncBackgroundColors: false,
    conversationBackgroundStyle: "#212121",
    sidebarBackgroundStyle: "#171717",
    syncedBackgroundStyle: "#212121",
    scrollToTopEnabled: true,
};
