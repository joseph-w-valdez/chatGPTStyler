import { Settings } from "@src/shared/settings";

/** Popup → content script: rebuild injected `#custom-style` CSS from settings. */
export type UpdateStylesMessage = {
    action: "updateStyles";
    settings: Settings;
};

/** Popup → content script: run delete-all DOM automation. */
export type DeleteMessagesMessage = {
    action: "deleteMessages";
};

export type SelectorInspectorMode = "pick" | "audit";

/** Dev-only popup → content script: open the on-page selector inspector. */
export type OpenSelectorInspectorMessage = {
    action: "openSelectorInspector";
    mode: SelectorInspectorMode;
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

/** Popup → content script: find and save replacements for broken selectors. */
export type RepairSelectorsMessage = {
    action: "repairSelectors";
};

/** Popup → content script: drop every saved repair and return to the registry. */
export type ResetSelectorRepairsMessage = {
    action: "resetSelectorRepairs";
};

export type RepairSummary = {
    repaired: Array<{ label: string; selector: string }>;
    stillBroken: string[];
    /** Required selectors that already worked. */
    healthy: number;
    /** Saved repairs in effect after this run. */
    activeRepairs: number;
};

/** Dev-only popup → content script: run Repair, then export what works. */
export type ExportWorkingSelectorsMessage = {
    action: "exportWorkingSelectors";
};

export type WorkingSelectorSource =
    | "default"
    | "fallback"
    | "repaired"
    | "override"
    | "none";

export type WorkingSelectorEntry = {
    label: string;
    /** pass / warn / fail from the live check; notOnPage for optional UI that is closed. */
    status: "pass" | "warn" | "fail" | "notOnPage";
    source: WorkingSelectorSource;
    /** The single alternative that currently matches, if any. */
    selector: string | null;
    count: number;
    notes: string[];
};

/** Ready to paste over the matching entries in src/shared/selectors.ts. */
export type RegistryPatch = Record<
    string,
    { defaultSelector: string; fallbacks: string[] }
>;

export type WorkingSelectorsExport = {
    generatedAt: string;
    page: string;
    extensionVersion: string;
    summary: {
        working: string[];
        repaired: string[];
        /** Match something, but a check raised doubts. */
        needsReview: string[];
        broken: string[];
        notOnPage: string[];
    };
    selectors: Record<string, WorkingSelectorEntry>;
    registryPatch: RegistryPatch;
};

export type ExportWorkingSelectorsResponse =
    | { status: "SUCCESS"; export: WorkingSelectorsExport }
    | { status: "FAILURE"; message: string };

export type RepairSelectorsResponse =
    | { status: "SUCCESS"; summary: RepairSummary }
    | { status: "FAILURE"; message: string };

export type ContentScriptMessage =
    | UpdateStylesMessage
    | DeleteMessagesMessage
    | OpenSelectorInspectorMessage
    | RepairSelectorsMessage
    | ResetSelectorRepairsMessage
    | ExportWorkingSelectorsMessage
    | UpdateBackgroundImageMessage;

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
