import { Settings } from "@src/shared/settings";

/** Popup → content script: replace injected `#custom-style` CSS. */
export type UpdateStylesMessage = {
    action: "updateStyles";
    arg: string;
};

/** Popup → content script: run delete-all DOM automation. */
export type DeleteMessagesMessage = {
    action: "deleteMessages";
};

/** Dev-only popup → content script: probe ChatGPT DOM selectors. */
export type CheckSelectorsMessage = {
    action: "checkSelectors";
};

/**
 * Popup → content script: refresh the injected background-image layer.
 * `dataUrl` is the stored image, or null to remove it. Kept separate from
 * `updateStyles` so the large data URL is only sent when the image changes.
 */
export type UpdateBackgroundImageMessage = {
    action: "updateBackgroundImage";
    dataUrl: string | null;
};

export type ContentScriptMessage =
    | UpdateStylesMessage
    | DeleteMessagesMessage
    | CheckSelectorsMessage
    | UpdateBackgroundImageMessage;

export type DeleteMessagesResponse =
    | { status: "SUCCESS" }
    | { status: "FAILURE"; message: string };

export type SelectorCheckItem = {
    id: string;
    label: string;
    selector: string;
    count: number;
    ok: boolean;
    optional: boolean;
};

export type SelectorCheckReport = {
    checkedAt: string;
    href: string;
    items: SelectorCheckItem[];
    requiredOk: number;
    requiredFail: number;
    optionalPresent: number;
};

export type CheckSelectorsResponse =
    | { status: "SUCCESS"; report: SelectorCheckReport }
    | { status: "FAILURE"; message: string };

/** Popup → background (port `name: "popup"`): mirror live settings. */
export type UpdateSettingsPortMessage = {
    type: "updateSettings";
    settings: Settings;
};

export type PopupPortMessage = UpdateSettingsPortMessage;

export const POPUP_PORT_NAME = "popup";
