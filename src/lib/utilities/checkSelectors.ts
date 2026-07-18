import { SelectorCheckItem, SelectorCheckReport } from "@src/shared/messaging";
import {
    CHAT_SCROLL_PARENT_SELECTOR,
    INPUT_BOX_CONTAINER_SELECTOR,
    SCROLL_CONTROL_HOST_SELECTOR,
    SCROLL_TO_TOP_MOUNT_ID,
    USER_TEXT_CONTAINER_SELECTOR,
} from "./chatDom";
import {
    CHAT_HISTORY_SELECTOR,
    CONFIRM_DELETE_BUTTON_SELECTOR,
    DATA_CONTROLS_TAB_SELECTOR,
    DELETE_ALL_BUTTON_SELECTOR,
    PROFILE_BUTTON_SELECTOR,
    SETTINGS_MENU_ITEM_SELECTOR,
} from "./deleteAllChats";

/** Shared with stylingFunctions — keep in sync if message turn selector changes. */
export const CONVERSATION_TURN_SELECTOR = '[data-testid^="conversation-turn-"]';

export type SelectorProbe = {
    id: string;
    label: string;
    selector: string;
    /** Minimum matches for a healthy open chat. Use 0 for informational probes. */
    expectAtLeast: number;
    /** When true, missing matches are expected unless the related UI is open. */
    optional?: boolean;
};

export const SELECTOR_PROBES: SelectorProbe[] = [
    {
        id: "turns",
        label: "Conversation turns",
        selector: CONVERSATION_TURN_SELECTOR,
        expectAtLeast: 1,
    },
    {
        id: "roles",
        label: "Message roles (fallback)",
        selector: "[data-message-author-role]",
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "userTextContainers",
        label: "User message containers",
        selector: USER_TEXT_CONTAINER_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "threadBottom",
        label: "Thread bottom / input shell",
        selector: INPUT_BOX_CONTAINER_SELECTOR,
        expectAtLeast: 1,
    },
    {
        id: "form",
        label: "Composer form",
        selector: "form",
        expectAtLeast: 1,
    },
    {
        id: "composerSubmit",
        label: "Composer submit button (when text entered)",
        selector: "#composer-submit-button",
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "scrollParent",
        label: "Scroll-to-top parent ([data-scroll-root])",
        selector: CHAT_SCROLL_PARENT_SELECTOR,
        expectAtLeast: 1,
    },
    {
        id: "threadBottomContainer",
        label: "Native scroll-control host (scroll-to-top mount host)",
        selector: SCROLL_CONTROL_HOST_SELECTOR,
        expectAtLeast: 1,
    },
    {
        id: "customStyle",
        label: "Injected #custom-style",
        selector: "#custom-style",
        expectAtLeast: 1,
    },
    {
        id: "scrollMount",
        label: "Scroll-to-top mount",
        selector: `#${SCROLL_TO_TOP_MOUNT_ID}`,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "chatHistory",
        label: "Sidebar chat history (conversations)",
        selector: CHAT_HISTORY_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "profile",
        label: "Profile menu button",
        selector: PROFILE_BUTTON_SELECTOR,
        expectAtLeast: 1,
    },
    {
        id: "settingsMenu",
        label: "Settings menu item (when profile menu open)",
        selector: SETTINGS_MENU_ITEM_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "dataControlsTab",
        label: "Data controls tab (when Settings open)",
        selector: DATA_CONTROLS_TAB_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "deleteAll",
        label: "Delete-all button (on Data controls)",
        selector: DELETE_ALL_BUTTON_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
    {
        id: "confirmDelete",
        label: "Confirm delete-all button (dialog)",
        selector: CONFIRM_DELETE_BUTTON_SELECTOR,
        expectAtLeast: 0,
        optional: true,
    },
];

/** Query the live document for extension-critical ChatGPT selectors. */
export const checkSelectors = (
    doc: ParentNode = document,
): SelectorCheckReport => {
    const href =
        typeof document !== "undefined" && document.location
            ? document.location.href
            : "";

    const items: SelectorCheckItem[] = SELECTOR_PROBES.map((probe) => {
        const count = doc.querySelectorAll(probe.selector).length;
        const optional = Boolean(probe.optional);
        const ok = optional || count >= probe.expectAtLeast;
        return {
            id: probe.id,
            label: probe.label,
            selector: probe.selector,
            count,
            ok,
            optional,
        };
    });

    const required = items.filter((item) => !item.optional);
    const optionalItems = items.filter((item) => item.optional);

    return {
        checkedAt: new Date().toISOString(),
        href,
        items,
        requiredOk: required.filter((item) => item.ok).length,
        requiredFail: required.filter((item) => !item.ok).length,
        optionalPresent: optionalItems.filter((item) => item.count > 0).length,
    };
};
