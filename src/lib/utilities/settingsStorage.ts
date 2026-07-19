import { defaultSettings, Settings } from "@src/shared/settings";

const pickSettings = (stored: Partial<Settings> | undefined): Settings => {
    const options = { ...defaultSettings };
    if (!stored) return options;

    (Object.keys(defaultSettings) as Array<keyof Settings>).forEach((key) => {
        const value = stored[key];
        if (value !== undefined) {
            options[key] = value as Settings[typeof key];
        }
    });

    return options;
};

export const getOptionsFromStorage = (
    callback: (options: Settings) => void,
): void => {
    chrome.storage.sync.get(["options"], (result) => {
        callback(pickSettings(result.options));
    });
};

export const saveOptionsToStorage = (options: Settings): void => {
    chrome.storage.sync.set({ options: pickSettings(options) });
};
