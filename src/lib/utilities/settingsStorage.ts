import { defaultSettings, Settings } from "@src/shared/settings";

const pickSettings = (stored: Partial<Settings> | undefined): Settings => {
    if (!stored) {
        return { ...defaultSettings };
    }

    const options = { ...defaultSettings };
    for (const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
        if (stored[key] !== undefined) {
            Object.assign(options, { [key]: stored[key] });
        }
    }

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
