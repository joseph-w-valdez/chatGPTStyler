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

export type ContentScriptMessage = UpdateStylesMessage | DeleteMessagesMessage;

export type DeleteMessagesResponse =
    | { status: "SUCCESS" }
    | { status: "FAILURE"; message: string };

/** Popup → background (port `name: "popup"`): mirror live settings. */
export type UpdateSettingsPortMessage = {
    type: "updateSettings";
    settings: Settings;
};

export type PopupPortMessage = UpdateSettingsPortMessage;

export const POPUP_PORT_NAME = "popup";
