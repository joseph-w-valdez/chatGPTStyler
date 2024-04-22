import React from "react";
import ReactDOM from "react-dom";
import { ScrollToTop } from "./components/scrollToTop/scrollToTop";
import { getOptionsFromStorage } from "./lib/utilities/googleStorage";
import { updateStyles } from "./shared/utils";
import { arrowUpAutoFill } from "./shared/utils/arrowUpAutofill";
console.log("Content script loaded.");

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);
arrowUpAutoFill();

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
const mountComponent = () => {
    const mountPoint = document.createElement("div");
    mountPoint.id = "scroll-to-top-mount";

    if (!document.getElementById("scroll-to-top-mount")) {
        const $parentDiv = document.querySelector(
            'div[role="presentation"] > div > div > div > div ',
        );
        if ($parentDiv) {
            $parentDiv.appendChild(mountPoint);
            ReactDOM.render(React.createElement(ScrollToTop), mountPoint);
        }
    }
};

const checkAndMountComponent = () => {
    mountComponent();
};

checkAndMountComponent();

setInterval(checkAndMountComponent, 1000);
