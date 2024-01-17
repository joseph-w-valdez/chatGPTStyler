export interface OptionsTypes {
    messageMaxWidthStyle: string;
    messageColorUserStyle: string;
    messageColorNonUserStyle: string;
    messagePaddingStyle: string;
    messageBorderRadiusStyle: string;
    inputBoxMaxWidthStyle: string;
    textColorUserStyle: string;
    textColorNonUserStyle: string;
    textSizeUserStyle: string;
    textSizeNonUserStyle: string;
    textWeightUserStyle: string;
    textWeightNonUserStyle: string;
}

export const getOptionsFromStorage = (
    callback: (options: OptionsTypes) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        const options = result.options || {
            messageMaxWidthStyle: "",
            messageColorUserStyle: "",
            messageColorNonUserStyle: "",
            messagePaddingStyle: "",
            messageBorderRadiusStyle: "",
            inputBoxMaxWidthStyle: "",
            textColorUserStyle: "",
            textColorNonUserStyle: "",
            textSizeUserStyle: "",
            textSizeNonUserStyle: "",
            textWeightUserStyle: "",
            textWeightNonUserStyle: "",
        };

        callback(options);
    });
};

export const saveOptionsToStorage = (options: OptionsTypes): void => {
    chrome.storage.sync.set({ options }, () => {
        // notify content scripts that settings have changed
        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
                if (tab.id !== undefined) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "SETTINGS_CHANGED",
                        payload: options,
                    });
                }
            }
        });
    });
};
