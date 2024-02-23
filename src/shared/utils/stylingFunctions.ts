import { SettingsType } from "@src/lib/utilities/googleStorage";

let messageMaxWidthStyle =
    "@media (min-width: 1200px) { [data-testid] > * > * { max-width: 75% } }";
let messagePaddingStyle = "";
let messageBorderRadiusStyle = "";
let inputBoxMaxWidthStyle = "";
let messageBoxColors = `
    .dark {
        [data-testid]:nth-child(even) > * > * { background-color: #4e7645 }
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
let messageColorUserStyle = "";
let messageColorChatGPTStyle = "";
let textColorUserStyle = "";
let textColorNonUserStyle = "";
let textSizeUserStyle = "";
let textSizeNonUserStyle = "";
let textWeightUserStyle = "";
let textWeightNonUserStyle = "";
const selectionColors = "";
const chatMessageButtons = `
    [data-testid] button {
      visibility: unset
    }
`;
const codeSnippetWidth = `
    [data-testid] > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
`;

const allStyles = () => {
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
        chatMessageButtons +
        codeSnippetWidth +
        messageColorUserStyle +
        messageColorChatGPTStyle
    );
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
    return allStyles();
};
// type StringOrVoid<T extends undefined | boolean> = T extends undefined ? string : void;
// export const updateMessageColorUser = <T extends undefined | boolean>(
//     color: string,
//     returnAllStyles?: T,
// ): StringOrVoid<T> => {
//     messageColorUserStyle = `
//         [data-testid]:nth-child(even) > * > * { background-color: ${color} !important }`;
//     if (returnAllStyles === undefined) return allStyles() as StringOrVoid<T>;
//     else return undefined as StringOrVoid<T>;
// };

export const setMessageColorUser = (
    color: string,
    returnAllStyles: boolean = true,
): string | void => {
    messageColorUserStyle = `
        [data-testid]:nth-child(even) > * > * { background-color: ${color} !important }`;
    if (returnAllStyles) return allStyles();
};

export const setMessageColorChatGPT = (
    color: string,
    returnAllStyles: boolean = true,
): string | void => {
    messageColorChatGPTStyle = `
        [data-testid]:nth-child(odd) > * > * { background-color: ${color} !important }`;
    if (returnAllStyles) return allStyles();
};

export const setMessageMaxWidth = (
    widthPercentage: number,
    returnAllStyles: boolean = true,
): string | void => {
    messageMaxWidthStyle = `
    @media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
    if (returnAllStyles) return allStyles();
};

export const setMessagePadding = (
    padding: number,
    returnAllStyles: boolean = true,
): string | void => {
    messagePaddingStyle = `
    [data-testid] > * > * { padding: ${padding}px; }`;
    if (returnAllStyles) return allStyles();
};

export const setMessageBorderRadius = (
    borderRadius: number,
    returnAllStyles: boolean = true,
): string | void => {
    messageBorderRadiusStyle = `
    [data-testid] > * > * { border-radius: ${borderRadius}px; }`;
    if (returnAllStyles) return allStyles();
};

export const setInputBoxMaxWidth = (
    widthPercentage: number,
    returnAllStyles: boolean = true,
): string | void => {
    inputBoxMaxWidthStyle = `
    @media (min-width: 1600px) {
      form { max-width: ${widthPercentage}% !important; }
    }`;
    if (returnAllStyles) return allStyles();
};

export const setTextColorStyle = (
    color: string,
    isUser: boolean,
    returnAllStyles: boolean = true,
): string | void => {
    if (isUser)
        textColorUserStyle = `
    [data-testid]:nth-child(even) > * > * > * > * > * { color: ${color}}`;
    else
        textColorNonUserStyle = `
    [data-testid]:nth-child(odd) > * > * > * > * > div p { color: ${color}}`;
    if (returnAllStyles) return allStyles();
};

export const setTextSizeStyle = (
    size: number,
    isUser: boolean,
    returnAllStyles: boolean = true,
): string | void => {
    if (isUser)
        textSizeUserStyle = `
    [data-testid]:nth-child(even) > * > * > * > * > * { font-size: ${size}px}`;
    else
        textSizeNonUserStyle = `
    [data-testid]:nth-child(odd) > * > * > * > * > div p { font-size: ${size}px}`;
    if (returnAllStyles) return allStyles();
};

export const setFontWeightStyle = (
    weight: string,
    isUser: boolean,
    returnAllStyles: boolean = true,
): string | void => {
    if (isUser)
        textWeightUserStyle = `
    [data-testid]:nth-child(even) > * > * > * > * > * { font-weight: ${weight}} `;
    else
        textWeightNonUserStyle = `
    [data-testid]:nth-child(odd) > * > * > * > * > div p { font-weight: ${weight}} `;
    if (returnAllStyles) return allStyles();
};

export const resetDefaultMessageColors = () => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: #4e7645 }
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
    return allStyles();
};

export const setDefaultSettings = () => {
    setMessageMaxWidth(95, false);
    setMessagePadding(10, false);
    setMessageBorderRadius(5, false);
    setInputBoxMaxWidth(70, false);
    return allStyles();
};

export const updateSettings = (newSettings: SettingsType) => {
    if (!newSettings) return setDefaultSettings();
    if (newSettings.messageMaxWidthStyle)
        setMessageMaxWidth(Number(newSettings.messageMaxWidthStyle), false);
    if (newSettings.messageColorUserStyle)
        setMessageColorUser(newSettings.messageColorUserStyle, false);
    if (newSettings.messageColorNonUserStyle)
        setMessageColorChatGPT(newSettings.messageColorNonUserStyle, false);
    if (newSettings.messagePaddingStyle)
        setMessagePadding(Number(newSettings.messagePaddingStyle), false);
    if (newSettings.messageBorderRadiusStyle)
        setMessageBorderRadius(
            Number(newSettings.messageBorderRadiusStyle),
            false,
        );
    if (newSettings.inputBoxMaxWidthStyle)
        setInputBoxMaxWidth(Number(newSettings.inputBoxMaxWidthStyle), false);
    if (newSettings.textColorUserStyle)
        setTextColorStyle(newSettings.textColorUserStyle, true, false);
    if (newSettings.textColorNonUserStyle)
        setTextColorStyle(newSettings.textColorNonUserStyle, false, false);
    if (newSettings.textSizeUserStyle)
        setTextSizeStyle(Number(newSettings.textSizeUserStyle), true, false);
    if (newSettings.textSizeNonUserStyle)
        setTextSizeStyle(
            Number(newSettings.textSizeNonUserStyle),
            false,
            false,
        );
    if (newSettings.textWeightUserStyle)
        setFontWeightStyle(newSettings.textWeightUserStyle, true, false);
    if (newSettings.textWeightNonUserStyle)
        setFontWeightStyle(newSettings.textWeightNonUserStyle, false, false);
    return allStyles();
};

export const loadSettings = (settings: SettingsType): string => {
    chrome.storage.sync.get(["options"], (result) => {
        const settings = result.options;
        console.log("STORAGE OPTIONS", result.options);
        if (settings) {
            // Assuming 'settings' is an object with appropriate properties
            // Update styles based on loaded settings
            if (settings.messageMaxWidthStyle)
                setMessageMaxWidth(
                    Number(settings.messageMaxWidthStyle),
                    false,
                );
            if (settings.messageColorUserStyle)
                setMessageColorUser(settings.messageColorUserStyle, false);
            if (settings.messageColorNonUserStyle)
                setMessageColorChatGPT(
                    settings.messageColorNonUserStyle,
                    false,
                );
            if (settings.messagePaddingStyle)
                setMessagePadding(Number(settings.messagePaddingStyle), false);
            if (settings.messageBorderRadiusStyle)
                setMessageBorderRadius(
                    settings.messageBorderRadiusStyle,
                    false,
                );
            if (settings.inputBoxMaxWidthStyle)
                setInputBoxMaxWidth(
                    Number(settings.inputBoxMaxWidthStyle),
                    false,
                );
            if (settings.textColorUserStyle)
                setTextColorStyle(settings.textColorUserStyle, true, false);
            if (settings.textColorNonUserStyle)
                setTextColorStyle(settings.textColorNonUserStyle, false, false);
            if (settings.textSizeUserStyle)
                setTextSizeStyle(settings.textSizeUserStyle, true, false);
            if (settings.textSizeNonUserStyle)
                setTextSizeStyle(settings.textSizeNonUserStyle, false, false);
            if (settings.textWeightUserStyle)
                setFontWeightStyle(settings.textWeightUserStyle, true, false);
            if (settings.textWeightNonUserStyle)
                setFontWeightStyle(
                    settings.textWeightNonUserStyle,
                    false,
                    false,
                );
            console.log("ALL SETTINGS", allStyles());
            return allStyles();
        } else {
            console.log("DID WE LOAD DEFAULT?");
            return setDefaultSettings();
        }
    });
    console.log("DO WE EVEN EVER GET HERE?", allStyles());
    return allStyles();
};
