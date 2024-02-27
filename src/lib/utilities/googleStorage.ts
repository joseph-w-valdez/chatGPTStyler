import { defaultSettings } from "@src/shared/utils/data";

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
    messageButtonsVisibilityStyle: string;
}

export const getOptionsFromStorage = (
    callback: (options: SettingsType) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        const options = result.options || { ...defaultSettings };
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
