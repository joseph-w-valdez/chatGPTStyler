import { defaultSettings, Settings } from "@src/shared/settings";

export const getOptionsFromStorage = (
    callback: (options: Settings) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        const options: Settings = {
            ...defaultSettings,
            ...(result.options || {}),
        };
        callback(options);
    });
};

export const saveOptionsToStorage = (options: Settings): void => {
    chrome.storage.sync.set({ options });
};
