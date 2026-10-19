import { SELECTOR_DEFINITIONS } from "@src/shared/selectors";
import { getActiveSelectors } from "./activeSelectors";
import { SCROLL_TO_TOP_MOUNT_ID } from "./chatDom";

export type SelectorProbe = {
    id: string;
    label: string;
    selector: string;
    /** Minimum matches for a healthy open chat. Use 0 for informational probes. */
    expectAtLeast: number;
    /** When true, missing matches are expected unless the related UI is open. */
    optional?: boolean;
};

// Not ChatGPT selectors: the extension's own nodes, plus a role fallback.
const EXTRA_PROBES: SelectorProbe[] = [
    {
        id: "roles",
        label: "Message roles (fallback)",
        selector: "[data-message-author-role]",
        expectAtLeast: 0,
        optional: true,
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
];

/** Registry selectors (with any dev overrides applied) plus extension nodes. */
export const getSelectorProbes = (): SelectorProbe[] => {
    const selectors = getActiveSelectors();
    return [
        ...SELECTOR_DEFINITIONS.map((definition) => ({
            id: definition.key,
            label: definition.label,
            selector: selectors[definition.key],
            expectAtLeast: definition.expectAtLeast,
            optional: definition.optional,
        })),
        ...EXTRA_PROBES,
    ];
};
