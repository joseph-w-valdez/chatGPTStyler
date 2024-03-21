import {
    SettingsType,
    getOptionsFromStorage,
} from "./lib/utilities/googleStorage";
import { updateStyles } from "./shared/utils";
console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = updateStyles(settings)),
);

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateStyles")
        customStyle.textContent = request.arg;
});
// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});
