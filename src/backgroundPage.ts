import { saveOptionsToStorage } from "./lib/utilities/googleStorage";
import { defaultSettings } from "./shared/utils/data";

let currentSettings = defaultSettings

chrome.runtime.onConnect.addListener((port) => {
    console.assert(port.name === "popup");
    port.onMessage.addListener((message) => {
        if (message.popupOpened) {
            console.log("Popup opened");
            // Optionally, initialize or send current settings to the popup
        } else if (message.type === 'updateSettings') {
            console.log("Received updated settings from popup:", message.settings);
            currentSettings = message.settings;
        }
        // You can also respond or send messages to the popup here
    });

    port.onDisconnect.addListener(() => {
        console.log("Popup closed. Settings are now:", currentSettings);
        // Call saveOptionsToStorage with the most recent settings state
        saveOptionsToStorage(currentSettings);
        // Note: Ensure `saveOptionsToStorage` is properly adapted to handle Promises if asynchronous
    });
});
