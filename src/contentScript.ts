import React from "react";
import ReactDOM from "react-dom";
import { ScrollToTop } from "./components/scrollToTop/ScrollToTop";
import { getOptionsFromStorage, deleteAllChats } from "./lib/utilities";
import { buildCss } from "./shared/utils";
import { removeUnnecessarySpace } from "@src/lib/utilities";
import {
    CHAT_SCROLL_PARENT_SELECTOR,
    INPUT_BOX_CONTAINER_SELECTOR,
    SCROLL_TO_TOP_MOUNT_ID,
    USER_TEXT_CONTAINER_SELECTOR,
} from "@src/lib/utilities/chatDom";
import { ContentScriptMessage } from "@src/shared/messaging";

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = buildCss(settings)),
);

chrome.runtime.onMessage.addListener(
    (request: ContentScriptMessage, _sender, sendResponse) => {
        if (request.action === "updateStyles") {
            customStyle.textContent = request.arg;
            return false;
        }

        if (request.action === "deleteMessages") {
            deleteAllChats()
                .then((result) => {
                    sendResponse(result);
                })
                .catch((error: unknown) => {
                    sendResponse({
                        status: "FAILURE",
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to delete chats",
                    });
                });
            // Keep the message channel open for the async response.
            return true;
        }

        return false;
    },
);

const syncLayoutHelpers = (): void => {
    const userTextContainer = document.querySelectorAll(
        USER_TEXT_CONTAINER_SELECTOR,
    );
    const inputBoxContainer = document.querySelector(
        INPUT_BOX_CONTAINER_SELECTOR,
    );

    removeUnnecessarySpace({ userTextContainer, inputBoxContainer });
};

const unmountScrollToTop = (mountPoint: Element): void => {
    ReactDOM.unmountComponentAtNode(mountPoint);
    mountPoint.remove();
};

const syncScrollToTop = (): void => {
    const parentDiv = document.querySelector(CHAT_SCROLL_PARENT_SELECTOR);
    const existingMount = document.getElementById(SCROLL_TO_TOP_MOUNT_ID);

    if (!(parentDiv instanceof HTMLElement)) {
        if (existingMount) {
            unmountScrollToTop(existingMount);
        }
        return;
    }

    if (existingMount && parentDiv.contains(existingMount)) {
        return;
    }

    if (existingMount) {
        unmountScrollToTop(existingMount);
    }

    const mountPoint = document.createElement("div");
    mountPoint.id = SCROLL_TO_TOP_MOUNT_ID;
    parentDiv.appendChild(mountPoint);
    ReactDOM.render(React.createElement(ScrollToTop), mountPoint);
};

const syncPageIntegrations = (): void => {
    syncLayoutHelpers();
    syncScrollToTop();
};

syncPageIntegrations();
setInterval(syncPageIntegrations, 1000);
