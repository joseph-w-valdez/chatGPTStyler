import React from "react";
import ReactDOM from "react-dom";
import { ScrollToTop } from "./components/scrollToTop/scrollToTop";
import { getOptionsFromStorage, deleteAllChats } from "./lib/utilities";
import { updateStyles } from "./shared/utils";
import { arrowUpAutoFill } from "./lib/utilities/arrowUpAutoFill";
import { removeUnnecessarySpace } from "@src/lib/utilities";
import { selectors } from "./shared/utils/data";

console.log("Content script loaded.");

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = updateStyles(settings)),
);

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateStyles") {
        customStyle.textContent = request.arg;
    } else if (request.action === "deleteMessages") {
        console.log("Received Message From Popup: Deleting All Messages");
        const deleteChats = deleteAllChats();
        if (deleteChats && deleteChats.message === "No chat history found") {
            sendResponse({ status: "FAILURE", message: deleteChats.message });
        } else {
            sendResponse({ status: "SUCCESS" });
        }
    }
    return true;
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});
const mountComponent = () => {
    const mountPoint = document.createElement("div");
    mountPoint.id = "scroll-to-top-mount";

    const userTextContainer: any = document.querySelectorAll(
        `${selectors.messageBubbles}:nth-child(odd) > * > * > * > * > * > div`,
    );

    const inputBoxContainer: any = document.querySelector(
        "#thread-bottom > * > div",
    );

    removeUnnecessarySpace({ userTextContainer, inputBoxContainer });

    if (!document.getElementById("scroll-to-top-mount")) {
        const $parentDiv = document.querySelector(selectors.scrollContainer);
        if ($parentDiv) {
            arrowUpAutoFill();
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
