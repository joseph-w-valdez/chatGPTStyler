import React from "react";
import { createRoot, Root } from "react-dom/client";
import { SelectorInspectorMode } from "@src/shared/messaging";
import { Settings } from "@src/shared/settings";
import { SelectorInspector } from "./SelectorInspector";
import { INSPECTOR_STYLES } from "./inspectorStyles";

export const SELECTOR_INSPECTOR_HOST_ID = "chatgpt-styler-selector-inspector";

// Stopped at the host so ChatGPT's document listeners (e.g. Radix menu
// dismissal) ignore interaction with the panel and keep open menus open.
const ISOLATED_EVENTS = [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "click",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "keydown",
    "keyup",
];

const TYPING_EVENTS = ["keydown", "keypress", "keyup"];

let host: HTMLElement | null = null;
let root: Root | null = null;
let requestId = 0;

/**
 * ChatGPT focuses its composer on keystrokes captured at the window, which
 * would steal focus from the workbench inputs. Typing itself is unaffected:
 * text entry and React's onChange run off the `input` event.
 */
const isolateTyping = (event: Event): void => {
    if (!host || !event.composedPath().includes(host)) return;
    const origin = event.composedPath()[0];
    if (
        origin instanceof HTMLInputElement ||
        origin instanceof HTMLTextAreaElement
    ) {
        event.stopImmediatePropagation();
    }
};

export const closeSelectorInspector = (): void => {
    TYPING_EVENTS.forEach((type) =>
        window.removeEventListener(type, isolateTyping, true),
    );
    root?.unmount();
    root = null;
    host?.remove();
    host = null;
};

export const openSelectorInspector = (
    mode: SelectorInspectorMode,
    getSettings: () => Settings | null,
): void => {
    if (!host || !root || !host.isConnected) {
        closeSelectorInspector();

        const nextHost = document.createElement("div");
        nextHost.id = SELECTOR_INSPECTOR_HOST_ID;
        Object.assign(nextHost.style, {
            position: "fixed",
            inset: "0",
            pointerEvents: "none",
            zIndex: "2147483647",
        });
        ISOLATED_EVENTS.forEach((type) =>
            nextHost.addEventListener(type, (event) => event.stopPropagation()),
        );
        TYPING_EVENTS.forEach((type) =>
            window.addEventListener(type, isolateTyping, true),
        );

        const shadow = nextHost.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = INSPECTOR_STYLES;
        const container = document.createElement("div");
        shadow.append(style, container);

        // Outside <body> so page audits and ChatGPT re-renders never touch it.
        document.documentElement.appendChild(nextHost);
        host = nextHost;
        root = createRoot(container);
    }

    requestId += 1;
    root.render(
        React.createElement(SelectorInspector, {
            mode,
            requestId,
            host,
            getSettings,
            onClose: closeSelectorInspector,
        }),
    );
};
