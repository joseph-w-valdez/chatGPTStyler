import { deleteAllChats } from "@src/lib/utilities";
import { SettingsType } from "@src/lib/utilities/googleStorage";

export const defaultSettings: SettingsType = {
    messageMaxWidthStyle: "95",
    messageColorUserStyle: "#0084FF",
    messageColorNonUserStyle: "#333333",
    messagePaddingStyle: "10",
    messageBorderRadiusStyle: "5",
    inputBoxMaxWidthStyle: "94",
    textColorUserStyle: "#FFFFFF",
    textColorNonUserStyle: "#FFFFFF",
    messageButtonsVisibilityStyle: true,
};

const messageBubbles = '[data-testid^="conversation-turn-"]';

export const selectors = {
    scrollContainer: 'div[role="presentation"] > div > div > div.flex',
    messageBubbles: '[data-testid^="conversation-turn-"]',
    codeSnippet: `${messageBubbles} > * > * > *:nth-child(2)`,
    hideBackgroundColorStyle: `${messageBubbles} .bg-token-message-surface`,
    showEditButtonStyle: `${messageBubbles} .hidden`,
    maxMessageBubbleWidth: `${messageBubbles} .bg-token-message-surface`,
    haveTransparentEditBox: `${messageBubbles} .bg-token-main-surface-tertiary`,
    removeInputBoxPadding: `main > [role="presentation"] > div:nth-child(2) > div > div`,
    unsetInputBoxMaxWidth: `main > [role="presentation"] > div:nth-child(2) > div > div > div`,
    messageMaxWidthStyle: `${messageBubbles} > * > div`,
    messagePaddingStyle: `${messageBubbles} > * > div`,
    messageBorderRadiusStyle: `${messageBubbles} > * > div`,
    messageColorUserStyle: `${messageBubbles} > div:nth-child(1) > div`,
    messageColorNonUserStyle: `${messageBubbles} > div:nth-child(2) > div`,
    textColorUserStyle: `${messageBubbles} > div:nth-child(1) > div`,
    textColorNonUserStyle: `${messageBubbles} > div:nth-child(2) > div`,
    messageButtonsVisibilityStyle: `${messageBubbles} .flex.gap-3`,
    userMessage: `${messageBubbles}:nth-child(odd) > * > *`,
    nonUserMessage: `${messageBubbles}:nth-child(even) > * > *`,
    textArea: `${messageBubbles} textarea`,
    userText: `${messageBubbles}:nth-child(odd)`,
    nonUserText: `${messageBubbles}:nth-child(even)`,
};
