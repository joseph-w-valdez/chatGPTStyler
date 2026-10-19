import {
    RegistryPatch,
    WorkingSelectorEntry,
    WorkingSelectorSource,
    WorkingSelectorsExport,
} from "@src/shared/messaging";
import {
    joinSelectors,
    SELECTOR_DEFINITIONS,
    selectorChain,
    SelectorDefinition,
} from "@src/shared/selectors";
import { Settings } from "@src/shared/settings";
import {
    getActiveSelector,
    getHealedSelectors,
    getSelectorAlternatives,
    getSelectorOverrides,
    splitSelectorList,
} from "./activeSelectors";
import { findTargetElements } from "./selectorDiscovery";
import { captureEnvironment } from "./selectorReport";
import { repairSelectors } from "./selectorRepair";
import { testSelector } from "./selectorTesting";

const countMatches = (doc: Document, selector: string): number => {
    try {
        return doc.querySelectorAll(selector).length;
    } catch {
        return 0;
    }
};

const sourceOf = (
    definition: SelectorDefinition,
    selector: string,
): WorkingSelectorSource => {
    if (getSelectorOverrides()[definition.key]) return "override";

    const repaired = getHealedSelectors()[definition.key];
    if (repaired && splitSelectorList(repaired.selector).includes(selector)) {
        return "repaired";
    }
    if (splitSelectorList(definition.defaultSelector).includes(selector)) {
        return "default";
    }
    return "fallback";
};

/**
 * Dev-only "Repair & export": runs Repair on the live page, then records the
 * selector that actually works for every registry entry and a patch that
 * promotes non-default winners into `defaultSelector` (keeping the old
 * default as a fallback), ready to paste into src/shared/selectors.ts.
 */
export const exportWorkingSelectors = ({
    settings,
    doc = document,
}: {
    settings: Settings | null;
    doc?: Document;
}): WorkingSelectorsExport => {
    const repair = repairSelectors({ settings, doc });
    const found = findTargetElements(doc);
    const environment = captureEnvironment(doc);

    const selectors: Record<string, WorkingSelectorEntry> = {};
    const registryPatch: RegistryPatch = {};
    const summary: WorkingSelectorsExport["summary"] = {
        working: [],
        repaired: repair.repaired.map((item) => item.label),
        needsReview: [],
        broken: [],
        notOnPage: [],
    };

    for (const definition of SELECTOR_DEFINITIONS) {
        const { key, label } = definition;
        const working =
            getSelectorAlternatives(key).find(
                (selector) => countMatches(doc, selector) > 0,
            ) || null;
        const result = testSelector({
            definition,
            selector: getActiveSelector(key),
            found: found.get(key) || [],
            settings,
            active: true,
            doc,
        });

        const status: WorkingSelectorEntry["status"] =
            !working && definition.optional ? "notOnPage" : result.status;

        const source = working ? sourceOf(definition, working) : "none";
        selectors[key] = {
            label,
            status,
            source,
            selector: working,
            count: working ? countMatches(doc, working) : 0,
            notes: result.messages,
        };

        if (status === "pass") summary.working.push(label);
        else if (status === "warn") summary.needsReview.push(label);
        else if (status === "fail") summary.broken.push(label);
        else if (status === "notOnPage") summary.notOnPage.push(label);

        // Only verified winners the registry does not know yet need promoting;
        // a working fallback is already covered.
        if (
            working &&
            working !== definition.defaultSelector &&
            status === "pass" &&
            (source === "repaired" || source === "override")
        ) {
            const previous =
                selectorChain(definition).flatMap(splitSelectorList);
            registryPatch[key] = {
                defaultSelector: working,
                fallbacks: splitSelectorList(
                    joinSelectors(
                        previous.filter((selector) => selector !== working),
                    ),
                ),
            };
        }
    }

    return {
        generatedAt: environment.capturedAt,
        page: environment.page,
        extensionVersion: environment.extensionVersion,
        summary,
        selectors,
        registryPatch,
    };
};
