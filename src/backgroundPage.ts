import {
    getOptionsFromStorage,
    saveOptionsToStorage,
} from "./lib/utilities/settingsStorage";
import { POPUP_PORT_NAME, PopupPortMessage } from "./shared/messaging";
import { Settings } from "./shared/settings";

let currentSettings: Settings | null = null;
let receivedFromPopup = false;

chrome.runtime.onConnect.addListener((port) => {
    console.assert(port.name === POPUP_PORT_NAME);

    // Seed from storage so a quick close before the popup sends updates
    // does not persist in-memory defaults over the user's saved options.
    getOptionsFromStorage((savedOptions) => {
        if (!receivedFromPopup) {
            currentSettings = savedOptions;
        }
    });

    port.onMessage.addListener((message: PopupPortMessage) => {
        if (message.type === "updateSettings") {
            currentSettings = message.settings;
            receivedFromPopup = true;
        }
    });

    port.onDisconnect.addListener(() => {
        // Intentional autosave-on-close. Skip only if we never learned any settings.
        if (currentSettings !== null) {
            saveOptionsToStorage(currentSettings);
        }
        receivedFromPopup = false;
    });
});
