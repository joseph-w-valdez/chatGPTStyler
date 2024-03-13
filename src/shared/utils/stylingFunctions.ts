import { SettingsType } from "@src/lib/utilities/googleStorage";

const messageBubbles = '[data-testid^="conversation-turn-"]';

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
    ${messageBubbles} > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
`;
const settingsController = {
    messageMaxWidthStyle: <T>(widthPercentage: T) => {
        messageMaxWidthStyle = `
            ${messageBubbles} > * > div { max-width: ${widthPercentage}% } 
          `;
    },
    messagePaddingStyle: <T>(padding: T) => {
        messagePaddingStyle = `
          ${messageBubbles} > * > div { padding: ${padding}px; }
        `;
    },
    messageBorderRadiusStyle: <T>(borderRadius: T) => {
        messageBorderRadiusStyle = `
          ${messageBubbles} > * > div { border-radius: ${borderRadius}px; }
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
          ${messageBubbles}:nth-child(even) > * > * { background-color: ${color} !important }
          ${messageBubbles} textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);;
            border-radius: 5px
        }
        `;
    },
    messageColorNonUserStyle: <T>(color: T) => {
        messageColorNonUserStyle = `
          ${messageBubbles}:nth-child(odd) > * > * { background-color: ${color} !important }
        `;
    },
    textColorUserStyle: <T>(color: T) => {
        textColorUserStyle = `
          ${messageBubbles}:nth-child(even) > * > * > *:nth-child(2) { color: ${color}}
        `;
    },
    textColorNonUserStyle: <T>(color: T) => {
        textColorNonUserStyle = `
            ${messageBubbles}:nth-child(odd) > * > * > *:nth-child(2)  { color: ${color}; p {color: ${color}}}
        `;
    },
    messageButtonsVisibilityStyle: <T>(visibility: T) => {
        const value = visibility ? "unset" : "invisible";
        messageButtonsVisibilityStyle = `
          ${messageBubbles} button { visibility: ${value} }
        `;
    },
};
// might need for light and dark modes
export const updateMessageColor = (
    userColor: string,
    chatGPTColor: string,
    isDark: boolean,
) => {
    messageBoxColors = `
      .dark {
        ${messageBubbles}:nth-child(even) > * > * { background-color: ${
        userColor ? userColor : "#4e7645"
    } }
        ${messageBubbles}:nth-child(odd) > * > * { background-color: ${
        chatGPTColor ? chatGPTColor : "#3c6083"
    } }
      }
      .light {
        ${messageBubbles}:nth-child(even) > * > * { background-color: ${
        userColor ? userColor : "#62B1F6"
    } }
        ${messageBubbles}:nth-child(odd) > * > * { background-color: ${
        chatGPTColor ? chatGPTColor : "#EEEEEE"
    } }
      }
      `;
};
// might need for light and dark modes
export const resetDefaultMessageColors = () => {
    messageBoxColors = `
      .dark {
        ${messageBubbles}:nth-child(even) > * > * { background-color: #4e7645 }
        ${messageBubbles}:nth-child(odd) > * > * { background-color: #3c6083 }
        ${messageBubbles} textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px
        }
      }
      .light {
        ${messageBubbles}:nth-child(even) > * > * { background-color: #62B1F6 }
        ${messageBubbles}:nth-child(odd) > * > * { background-color: #EEEEEE }
        ${messageBubbles} textarea {
            padding: 3px;
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 5px
        }
      }`;
};
// accepts a SettingsType object, we can update multiple settings at once here.
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
        messageColorNonUserStyle
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
