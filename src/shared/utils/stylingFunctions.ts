import { SettingsType } from "@src/lib/utilities/googleStorage";

let messageMaxWidthStyle = "";
let messagePaddingStyle = "";
let messageBorderRadiusStyle = "";
let inputBoxMaxWidthStyle = "";
let messageBoxColors = "";
let messageColorUserStyle = "";
let messageColorNonUserStyle = "";
let textColorUserStyle = "";
let textColorNonUserStyle = "";
let textSizeUserStyle = "";
let textSizeNonUserStyle = "";
let textWeightUserStyle = "";
let textWeightNonUserStyle = "";
const selectionColors = "";
let messageButtonsVisibilityStyle = ``;
const codeSnippetWidth = `
    [data-testid] > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
`;

const settingsController = {
    messageMaxWidthStyle: (widthPercentage: string) => {
        messageMaxWidthStyle = `
          @media (min-width: 1200px) {
            [data-testid] > * > * { max-width: ${widthPercentage}% } 
          }`;
    },
    messagePaddingStyle: (padding: string) => {
        messagePaddingStyle = `
          [data-testid] > * > * { padding: ${padding}px; }
        `;
    },
    messageBorderRadiusStyle: (borderRadius: string) => {
        messageBorderRadiusStyle = `
          [data-testid] > * > * { border-radius: ${borderRadius}px; }
        `;
    },
    inputBoxMaxWidthStyle: (widthPercentage: string) => {
        inputBoxMaxWidthStyle = `
        @media (min-width: 1600px) {
          form { max-width: ${widthPercentage}% !important; }
        }`;
    },
    messageColorUserStyle: (color: string) => {
        messageColorUserStyle = `
          [data-testid]:nth-child(even) > * > * { background-color: ${color} !important }`;
    },
    messageColorNonUserStyle: (color: string) => {
        messageColorNonUserStyle = `
          [data-testid]:nth-child(odd) > * > * { background-color: ${color} !important 
        }`;
    },
    textColorUserStyle: (color: string) => {
        textColorUserStyle = `
          [data-testid]:nth-child(even) > * > * > * > * > * { color: ${color}}
        `;
    },
    textColorNonUserStyle: (color: string) => {
        textColorNonUserStyle = `
            [data-testid]:nth-child(odd) > * > * > * > * > div p { color: ${color}}
          `;
    },
    textSizeUserStyle: (size: string) => {
        textSizeUserStyle = `
          [data-testid]:nth-child(even) > * > * > * > * > * { font-size: ${size}px}
        `;
    },
    textSizeNonUserStyle: (size: string) => {
        textSizeNonUserStyle = `
          [data-testid]:nth-child(odd) > * > * > * > * > div p { font-size: ${size}px}
        `;
    },
    textWeightUserStyle: (weight: string) => {
        textWeightUserStyle = `
          [data-testid]:nth-child(even) > * > * > * > * > * { font-weight: ${weight}} 
        `;
    },
    textWeightNonUserStyle: (weight: string) => {
        textWeightNonUserStyle = `
          [data-testid]:nth-child(odd) > * > * > * > * > div p { font-weight: ${weight}} 
        `;
    },
    messageButtonsVisibilityStyle: (visibility: string) => {
        messageButtonsVisibilityStyle = `
          [data-testid] button { visibility: ${visibility} }
        `;
    },
};

export const updateMessageColor = (
    userColor: string,
    chatGPTColor: string,
    isDark: boolean,
) => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            userColor ? userColor : "#4e7645"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            chatGPTColor ? chatGPTColor : "#3c6083"
        } }
      }
      .light {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            userColor ? userColor : "#62B1F6"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            chatGPTColor ? chatGPTColor : "#EEEEEE"
        } }
      }
      `;
    // return updateStyles();
};

export const resetDefaultMessageColors = () => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: #EDF5FD }
        [data-testid]:nth-child(odd) > * > * { background-color: #3c6083 }
        [data-testid] textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px
        }
      }
      .light {
        [data-testid]:nth-child(even) > * > * { background-color: #62B1F6 }
        [data-testid]:nth-child(odd) > * > * { background-color: #EEEEEE }
        [data-testid] textarea {
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
    newValue?: string,
) => {
    resetDefaultMessageColors(); // need to update default settings in getOptionsFromStorage then we can remove this
    if (typeof setting !== "string") loadSettings(setting);
    if (typeof setting === "string" && newValue)
        settingsController[setting](newValue);
    return (
        messageBoxColors +
        messageMaxWidthStyle +
        messagePaddingStyle +
        messageBorderRadiusStyle +
        inputBoxMaxWidthStyle +
        textColorUserStyle +
        textColorNonUserStyle +
        textSizeUserStyle +
        textSizeNonUserStyle +
        textWeightUserStyle +
        textWeightNonUserStyle +
        selectionColors +
        messageButtonsVisibilityStyle +
        codeSnippetWidth +
        messageColorUserStyle +
        messageColorNonUserStyle
    );
};

export const sendMessageToTab = (
    action: keyof SettingsType | "restoreSettings",
    value: string | SettingsType,
) => {
    let cssTextContent = "";
    if (action === "restoreSettings" && typeof value !== "string")
        cssTextContent = updateStyles(value);
    else if (action !== "restoreSettings" && typeof value === "string") {
        //
        // const newSettings: SettingsType = {
        //     ...liveChanges,
        //     [action]: value,
        // };
        // cssTextContent = update.updateStyles(newSettings);
        //
        cssTextContent = updateStyles(action, value);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id || 0, {
            action: "updateStyles",
            arg: cssTextContent,
        });
    });
};
