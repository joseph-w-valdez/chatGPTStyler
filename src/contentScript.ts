import { getOptionsFromStorage } from "./lib/utilities/googleStorage";
import * as update from "./shared/utils";
console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = update.updateSettings(settings)),
);

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "messageMaxWidthStyle")
        customStyle.textContent = update.setMessageMaxWidth(request.arg) || "";
    else if (request.action === "messagePaddingStyle")
        customStyle.textContent = update.setMessagePadding(request.arg) || "";
    else if (request.action === "messageBorderRadiusStyle")
        customStyle.textContent =
            update.setMessageBorderRadius(request.arg) || "";
    else if (request.action === "inputBoxMaxWidthStyle")
        customStyle.textContent = update.setInputBoxMaxWidth(request.arg) || "";
    else if (request.action === "User")
        customStyle.textContent = update.setMessageColorUser(request.arg) || "";
    else if (request.action === "Chat")
        customStyle.textContent =
            update.setMessageColorChatGPT(request.arg) || "";
    else if (request.action === "messageColorUserStyle")
        customStyle.textContent = update.setMessageColorUser(request.arg) || "";
    else if (request.action === "messageColorNonUserStyle")
        customStyle.textContent =
            update.setMessageColorChatGPT(request.arg) || "";
    else if (request.action === "textColorUserStyle")
        customStyle.textContent =
            update.setTextColorStyle(request.arg, true) || "";
    else if (request.action === "textColorNonUserStyle")
        customStyle.textContent =
            update.setTextColorStyle(request.arg, true) || "";
    else if (request.action === "restoreUserSettings")
        customStyle.textContent = update.updateSettings(request.arg);
    else if (request.action === "restoreDefaultSettings")
        customStyle.textContent = update.setDefaultSettings();
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});
