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
    messageButtonsVisibilityStyle: boolean;
}

export const getOptionsFromStorage = (
    callback: (options: SettingsType) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        const options: SettingsType = {
            ...defaultSettings,
            ...(result.options || {}),
        };
        callback(options);
        console.log("GETTING OPTIONS FROM STORAGE", options);
    });
};

export const saveOptionsToStorage = (options: SettingsType): void => {
    console.log("SAVING OPTIONS TO STORAGE", options);
    chrome.storage.sync.set({ options });
};
