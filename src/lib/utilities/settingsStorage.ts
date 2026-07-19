import { defaultSettings, Settings } from "@src/shared/settings";
import { BACKGROUND_IMAGE_STORAGE_KEY } from "@src/shared/backgroundImage";

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

// The background image data URL is stored in chrome.storage.local because it
// exceeds chrome.storage.sync's per-item quota.
export const getBackgroundImage = (
    callback: (dataUrl: string | null) => void,
): void => {
    chrome.storage.local.get([BACKGROUND_IMAGE_STORAGE_KEY], (result) => {
        const value = result[BACKGROUND_IMAGE_STORAGE_KEY];
        callback(typeof value === "string" ? value : null);
    });
};

export const saveBackgroundImage = (
    dataUrl: string,
    callback?: () => void,
): void => {
    chrome.storage.local.set(
        { [BACKGROUND_IMAGE_STORAGE_KEY]: dataUrl },
        () => {
            void chrome.runtime.lastError;
            if (callback) callback();
        },
    );
};

export const clearBackgroundImage = (callback?: () => void): void => {
    chrome.storage.local.remove(BACKGROUND_IMAGE_STORAGE_KEY, () => {
        void chrome.runtime.lastError;
        if (callback) callback();
    });
};
