export interface SettingsType {
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
    callback: (options: SettingsType) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        const options = result.options || {
            messageMaxWidthStyle: 95,
            messageColorUserStyle: "",
            messageColorNonUserStyle: "",
            messagePaddingStyle: 10,
            messageBorderRadiusStyle: 5,
            inputBoxMaxWidthStyle: 70,
            textColorUserStyle: "",
            textColorNonUserStyle: "",
            textSizeUserStyle: "",
            textSizeNonUserStyle: "",
            textWeightUserStyle: "",
            textWeightNonUserStyle: "",
        };

        callback(options);
        console.log("GETTING OPTIONS FROM STORAGE", options);
    });
};

export const saveOptionsToStorage = (options: SettingsType): void => {
    console.log("SAVING OPTIONS TO STORAGE", options);
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
