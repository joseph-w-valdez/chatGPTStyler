import React from "react";
import { createRoot, Root } from "react-dom/client";
import { ScrollToTop } from "./components/scrollToTop/ScrollToTop";
import { openSelectorInspector } from "./components/selectorInspector";
import {
    getOptionsFromStorage,
    getBackgroundImage,
    deleteAllChats,
} from "./lib/utilities";
import { buildCss } from "./shared/utils";
import { SCROLL_TO_TOP_MOUNT_ID } from "@src/lib/utilities/chatDom";
import {
    getActiveSelectors,
    getHealedSelectors,
    loadHealedSelectors,
    loadSelectorOverrides,
    onActiveSelectorsChange,
    queryActive,
    setHealedSelectors,
} from "@src/lib/utilities/activeSelectors";
import { repairSelectors } from "@src/lib/utilities/selectorRepair";
import { exportWorkingSelectors } from "@src/lib/utilities/selectorExport";
import {
    BACKGROUND_LAYER_ID,
    BACKGROUND_LAYER_IMAGE_CLASS,
} from "@src/shared/backgroundImage";
import { ContentScriptMessage } from "@src/shared/messaging";
import { Settings } from "@src/shared/settings";

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

let currentSettings: Settings | null = null;

const applyStyles = (): void => {
    if (currentSettings) {
        customStyle.textContent = buildCss(
            currentSettings,
            getActiveSelectors(),
        );
    }
};

getOptionsFromStorage((settings) => {
    currentSettings = settings;
    applyStyles();
});

// Cached background image data URL (stored in chrome.storage.local). The CSS in
// #custom-style controls whether the layer is shown / its opacity; the content
// script only owns the layer element and its image source.
let backgroundImageDataUrl: string | null = null;

chrome.runtime.onMessage.addListener(
    (request: ContentScriptMessage, _sender, sendResponse) => {
        if (request.action === "updateStyles") {
            currentSettings = request.settings;
            applyStyles();
            return false;
        }

        if (
            process.env.NODE_ENV === "development" &&
            request.action === "repairSelectors"
        ) {
            try {
                sendResponse({
                    status: "SUCCESS",
                    summary: repairSelectors({ settings: currentSettings }),
                });
            } catch (error: unknown) {
                sendResponse({
                    status: "FAILURE",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Layout repair failed",
                });
            }
            return false;
        }

        if (
            process.env.NODE_ENV === "development" &&
            request.action === "resetSelectorRepairs"
        ) {
            setHealedSelectors({});
            sendResponse({
                status: "SUCCESS",
                summary: {
                    repaired: [],
                    stillBroken: [],
                    healthy: 0,
                    activeRepairs: Object.keys(getHealedSelectors()).length,
                },
            });
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
            request.action === "exportWorkingSelectors"
        ) {
            try {
                sendResponse({
                    status: "SUCCESS",
                    export: exportWorkingSelectors({
                        settings: currentSettings,
                    }),
                });
            } catch (error: unknown) {
                sendResponse({
                    status: "FAILURE",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Selector export failed",
                });
            }
            return false;
        }

        if (
            process.env.NODE_ENV === "development" &&
            request.action === "openSelectorInspector"
        ) {
            openSelectorInspector(request.mode, () => currentSettings);
            sendResponse({ status: "SUCCESS" });
            return false;
        }

        return false;
    },
);

// Opening the popup closes ChatGPT's menus and dialogs, so shortcuts let the
// inspector reach elements that only exist while that UI is open.
if (process.env.NODE_ENV === "development") {
    window.addEventListener(
        "keydown",
        (event) => {
            if (
                !event.altKey ||
                !event.shiftKey ||
                event.ctrlKey ||
                event.metaKey
            ) {
                return;
            }
            const mode =
                event.code === "KeyP"
                    ? "pick"
                    : event.code === "KeyA"
                    ? "audit"
                    : null;
            if (!mode) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openSelectorInspector(mode, () => currentSettings);
        },
        true,
    );
}

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
    const scrollParent = queryActive("scrollRoot");
    const mountHost = queryActive("scrollControlHost");
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
    const scrollParent = queryActive("scrollRoot");
    if (scrollParent instanceof HTMLElement && scrollParent.parentElement) {
        return scrollParent.parentElement;
    }
    const main = queryActive("conversationMain");
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
    syncScrollToTop();
    syncBackgroundImage();
};

getBackgroundImage((dataUrl) => {
    backgroundImageDataUrl = dataUrl;
    syncBackgroundImage();
});

onActiveSelectorsChange(() => {
    applyStyles();
    // ScrollToTop binds to its scroll root on mount, so force a remount.
    const existingMount = document.getElementById(SCROLL_TO_TOP_MOUNT_ID);
    if (existingMount) unmountScrollToTop(existingMount);
    syncPageIntegrations();
});
// Production only runs the registry's reviewed selectors.
if (process.env.NODE_ENV === "development") {
    loadHealedSelectors();
    loadSelectorOverrides();
}

syncPageIntegrations();
setInterval(syncPageIntegrations, 1000);
