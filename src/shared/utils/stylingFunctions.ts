import { SettingsType } from "@src/lib/utilities/googleStorage";
import { selectors } from "./data";

let messageMaxWidthStyle = "";
let messagePaddingStyle = "";
let messageBorderRadiusStyle = "";
let inputBoxMaxWidthStyle = "";
let messageBoxColors = "";
let messageColorUserStyle = "";
let messageColorNonUserStyle = "";
let textColorUserStyle = "";
let textColorNonUserStyle = "";
const selectionColors = "";
let messageButtonsVisibilityStyle = ``;
const codeSnippetWidth = `
    ${selectors.codeSnippet} {
        width: 100%;
        max-width: calc(100% - 72px);
    } 
        html.light #composer-submit-button { color:white }
`;
const hideBackgroundColorStyle = `${selectors.hideBackgroundColorStyle} {
    background-color: unset;
}`;
const showEditButtonStyle = `${selectors.showEditButtonStyle} {
    display: block !important;
}`;
const maxMessageBubbleWidth = `${selectors.maxMessageBubbleWidth} { 
    max-width: calc(100% - 40px);
    width: calc(100% - 40px);
}`;
const haveTransparentEditBox = `${selectors.haveTransparentEditBox} {
    background: transparent;
}`;
const removeInputBoxPadding = `${selectors.removeInputBoxPadding} {
    padding-left: 0;
}`;
const unsetInputBoxMaxWidth = `${selectors.unsetInputBoxMaxWidth} {
    max-width: unset;
}`;
const settingsController = {
    messageMaxWidthStyle: <T>(widthPercentage: T) => {
        messageMaxWidthStyle = `
            ${selectors.messageMaxWidthStyle} { max-width: ${widthPercentage}% } 
          `;
    },
    messagePaddingStyle: <T>(padding: T) => {
        messagePaddingStyle = `
          ${selectors.messagePaddingStyle} { padding: ${padding}px; }
        `;
    },
    messageBorderRadiusStyle: <T>(borderRadius: T) => {
        messageBorderRadiusStyle = `
          ${selectors.messageBorderRadiusStyle}{ border-radius: ${borderRadius}px; }
        `;
    },
    inputBoxMaxWidthStyle: <T>(widthPercentage: T) => {
        inputBoxMaxWidthStyle = `
          form { 
            max-width: ${widthPercentage}% !important;
            margin: auto !important;
            min-width: 300px
        }`;
    },
    messageColorUserStyle: <T>(color: T) => {
        if (typeof color === "string")
            messageColorUserStyle = `
          ${selectors.userMessage} { background-color: ${color} !important }
          ${selectors.textArea} {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);;
            border-radius: 5px
        }
        `;
    },
    messageColorNonUserStyle: <T>(color: T) => {
        messageColorNonUserStyle = `
          ${selectors.nonUserMessage} { background-color: ${color} !important }
        `;
    },
    textColorUserStyle: <T>(color: T) => {
        textColorUserStyle = `
          ${selectors.userText} { color: ${color} }
        `;
    },
    textColorNonUserStyle: <T>(color: T) => {
        textColorNonUserStyle = `
            ${selectors.nonUserText} { color: ${color};
                div > div > div:nth-child(2) > div, p, ul, li, strong, p > code, ul code, li::before, h1, h2, h3, h4 { 
                    color: ${color};}}
        `;
    },
    messageButtonsVisibilityStyle: <T>(visibility: T) => {
        const value = visibility ? "unset" : "invisible";
        messageButtonsVisibilityStyle = `
          ${selectors.messageBubbles} button { visibility: ${value} }
        `;
    },
};

export const loadSettings = (newSettings: SettingsType) => {
    for (const key in newSettings) {
        const setting = key as keyof SettingsType;
        if (newSettings[setting]) {
            settingsController[setting](newSettings[setting]);
        }
    }
};

export const updateStyles = (
    setting: keyof SettingsType | SettingsType,
    newValue?: string | boolean,
) => {
    if (typeof setting !== "string") loadSettings(setting);
    if (typeof setting === "string" && newValue !== undefined)
        settingsController[setting](newValue);
    return (
        messageBoxColors +
        messageMaxWidthStyle +
        messagePaddingStyle +
        messageBorderRadiusStyle +
        inputBoxMaxWidthStyle +
        textColorUserStyle +
        textColorNonUserStyle +
        selectionColors +
        messageButtonsVisibilityStyle +
        codeSnippetWidth +
        messageColorUserStyle +
        messageColorNonUserStyle +
        hideBackgroundColorStyle +
        showEditButtonStyle +
        maxMessageBubbleWidth +
        haveTransparentEditBox +
        removeInputBoxPadding +
        unsetInputBoxMaxWidth
    );
};

export const sendMessageToTab = (
    action: keyof SettingsType | "restoreSettings",
    value: string | boolean | SettingsType,
) => {
    let cssTextContent = "";
    if (
        action === "restoreSettings" &&
        typeof value !== "string" &&
        typeof value !== "boolean"
    )
        cssTextContent = updateStyles(value);
    else if (
        action !== "restoreSettings" &&
        (typeof value === "string" || typeof value === "boolean")
    ) {
        cssTextContent = updateStyles(action, value);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id || 0, {
            action: "updateStyles",
            arg: cssTextContent,
        });
    });
};
