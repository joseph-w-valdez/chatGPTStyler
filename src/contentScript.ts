import {
    SettingsType,
    getOptionsFromStorage,
} from "./lib/utilities/googleStorage";
import * as update from "./shared/utils";
import { defaultSettings } from "./shared/utils/data";
console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = update.loadSettings(settings)),
);

const $main = document.querySelector("main");

if ($main) {
    const scrollToBottom = () => {
        const $messagesContainer = document.querySelector(
            '[role="presentation"] > div > div > div',
        );
        if ($messagesContainer) {
            setTimeout(
                () =>
                    ($messagesContainer.scrollTop =
                        $messagesContainer.scrollHeight),
                0,
            );
            $messagesContainer.scrollTop = $messagesContainer.scrollHeight;
        }
    };

    $main.addEventListener("keydown", (event: KeyboardEvent) => {
        if (
            event.target instanceof HTMLTextAreaElement &&
            event.target.getAttribute("id") === "prompt-textarea" &&
            event.target.textContent !== "" &&
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            scrollToBottom();
        }
    });

    $main.addEventListener("click", (event) => {
        if (
            (event.target instanceof SVGElement ||
                event.target instanceof HTMLButtonElement) &&
            event.target
                .closest('[data-testid="send-button"]')
                ?.getAttribute("data-testid") === "send-button"
        ) {
            scrollToBottom();
        }
    });
}
// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //         if (request.action === "updateStyles")
    //         customStyle.textContent = request.arg;
    // });
    if (request.action in defaultSettings) {
        const updatedSetting: keyof SettingsType = request.action;
        customStyle.textContent = update.updateStyles(
            updatedSetting,
            request.arg,
        );
    } else if (request.action === "restoreSettings")
        customStyle.textContent = update.loadSettings(request.arg);
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});
