import React from "react";
import { createRoot, Root } from "react-dom/client";
import { ScrollToTop } from "./components/scrollToTop/ScrollToTop";
import {
    getOptionsFromStorage,
    getBackgroundImage,
    deleteAllChats,
    checkSelectors,
} from "./lib/utilities";
import { buildCss } from "./shared/utils";
import { removeUnnecessarySpace } from "@src/lib/utilities";
import {
    CHAT_SCROLL_PARENT_SELECTOR,
    CONVERSATION_MAIN_SELECTOR,
    INPUT_BOX_CONTAINER_SELECTOR,
    SCROLL_CONTROL_HOST_SELECTOR,
    SCROLL_TO_TOP_MOUNT_ID,
    USER_TEXT_CONTAINER_SELECTOR,
} from "@src/lib/utilities/chatDom";
import {
    BACKGROUND_LAYER_ID,
    BACKGROUND_LAYER_IMAGE_CLASS,
} from "@src/shared/backgroundImage";
import { ContentScriptMessage } from "@src/shared/messaging";

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

getOptionsFromStorage(
    (settings) => (customStyle.textContent = buildCss(settings)),
);

// Cached background image data URL (stored in chrome.storage.local). The CSS in
// #custom-style controls whether the layer is shown / its opacity; the content
// script only owns the layer element and its image source.
let backgroundImageDataUrl: string | null = null;

chrome.runtime.onMessage.addListener(
    (request: ContentScriptMessage, _sender, sendResponse) => {
        if (request.action === "updateStyles") {
            customStyle.textContent = request.arg;
            return false;
        }

        if (request.action === "updateBackgroundImage") {
            backgroundImageDataUrl = request.dataUrl;
            syncBackgroundImage();
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

        if (
            process.env.NODE_ENV === "development" &&
            request.action === "checkSelectors"
        ) {
            try {
                const report = checkSelectors(document);
                // eslint-disable-next-line no-console
                console.table(
                    report.items.map((item) => ({
                        id: item.id,
                        count: item.count,
                        ok: item.ok,
                        optional: item.optional,
                        selector: item.selector,
                    })),
                );
                sendResponse({ status: "SUCCESS", report });
            } catch (error: unknown) {
                sendResponse({
                    status: "FAILURE",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Selector check failed",
                });
            }
            return false;
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

const scrollToTopRoots = new WeakMap<Element, Root>();

const unmountScrollToTop = (mountPoint: Element): void => {
    const root = scrollToTopRoots.get(mountPoint);
    if (root) {
        root.unmount();
        scrollToTopRoots.delete(mountPoint);
    }
    mountPoint.remove();
};

const syncScrollToTop = (): void => {
    const scrollParent = document.querySelector(CHAT_SCROLL_PARENT_SELECTOR);
    const mountHost = document.querySelector(SCROLL_CONTROL_HOST_SELECTOR);
    const existingMount = document.getElementById(SCROLL_TO_TOP_MOUNT_ID);

    if (
        !(scrollParent instanceof HTMLElement) ||
        !(mountHost instanceof HTMLElement)
    ) {
        if (existingMount) {
            unmountScrollToTop(existingMount);
        }
        return;
    }

    if (existingMount && mountHost.contains(existingMount)) {
        return;
    }

    if (existingMount) {
        unmountScrollToTop(existingMount);
    }

    const mountPoint = document.createElement("div");
    mountPoint.id = SCROLL_TO_TOP_MOUNT_ID;
    mountHost.appendChild(mountPoint);
    const root = createRoot(mountPoint);
    scrollToTopRoots.set(mountPoint, root);
    root.render(React.createElement(ScrollToTop));
};

// The background layer is bounded to the conversation column (excludes the
// sidebar) and stays put while the inner scrollport scrolls, so it mounts into
// the scrollport's non-scrolling parent (falling back to <main>).
const getBackgroundLayerHost = (): HTMLElement | null => {
    const scrollParent = document.querySelector(CHAT_SCROLL_PARENT_SELECTOR);
    if (scrollParent instanceof HTMLElement && scrollParent.parentElement) {
        return scrollParent.parentElement;
    }
    const main = document.querySelector(CONVERSATION_MAIN_SELECTOR);
    return main instanceof HTMLElement ? main : null;
};

const createBackgroundLayer = (): HTMLElement => {
    const layer = document.createElement("div");
    layer.id = BACKGROUND_LAYER_ID;
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        pointerEvents: "none",
        overflow: "hidden",
        // Hidden until generated CSS enables it, so it never flashes when off.
        display: "none",
    });

    const image = document.createElement("div");
    image.className = BACKGROUND_LAYER_IMAGE_CLASS;
    Object.assign(image.style, {
        position: "absolute",
        inset: "0",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    });
    layer.appendChild(image);

    return layer;
};

const syncBackgroundImage = (): void => {
    const host = getBackgroundLayerHost();

    if (!backgroundImageDataUrl || !host) {
        document.getElementById(BACKGROUND_LAYER_ID)?.remove();
        return;
    }

    let layer = document.getElementById(BACKGROUND_LAYER_ID);
    if (!layer) {
        layer = createBackgroundLayer();
    }

    // Absolute layer must resolve against a positioned host to stay bounded to
    // the conversation column.
    if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
    }

    // Keep it as the first child so sibling content paints above it.
    if (layer.parentElement !== host || host.firstChild !== layer) {
        host.insertBefore(layer, host.firstChild);
    }

    const image = layer.querySelector<HTMLElement>(
        `.${BACKGROUND_LAYER_IMAGE_CLASS}`,
    );
    if (image) {
        const nextImage = `url("${backgroundImageDataUrl}")`;
        if (image.style.backgroundImage !== nextImage) {
            image.style.backgroundImage = nextImage;
        }
    }
};

const syncPageIntegrations = (): void => {
    syncLayoutHelpers();
    syncScrollToTop();
    syncBackgroundImage();
};

getBackgroundImage((dataUrl) => {
    backgroundImageDataUrl = dataUrl;
    syncBackgroundImage();
});

syncPageIntegrations();
setInterval(syncPageIntegrations, 1000);
