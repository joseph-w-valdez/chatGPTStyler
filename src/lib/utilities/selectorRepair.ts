import { RepairSummary } from "@src/shared/messaging";
import {
    getSelectorDefinition,
    SELECTOR_DEFINITIONS,
    SelectorKey,
} from "@src/shared/selectors";
import { Settings } from "@src/shared/settings";
import {
    getActiveSelector,
    getSelectorOverrides,
    HealedSelectors,
    setHealedSelectors,
} from "./activeSelectors";
import { discoverSelectors, findTargetElements } from "./selectorDiscovery";
import { testSelector } from "./selectorTesting";

/**
 * "Repair layout": for every required selector that no longer works, try the
 * heuristic suggestions in rank order and keep the first that both dry-runs
 * cleanly and still passes once the extension really uses it (including the
 * live effect and visibility checks). Anything doubtful is left unrepaired.
 *
 * Starts from the registry alone, so repairs from an earlier ChatGPT update
 * are dropped once the built-in selectors work again.
 */
export const repairSelectors = ({
    settings,
    doc = document,
}: {
    settings: Settings | null;
    doc?: Document;
}): RepairSummary => {
    const healed: HealedSelectors = {};
    setHealedSelectors(healed, { persist: false });

    const found = findTargetElements(doc);
    const report = discoverSelectors(doc, found);
    const overrides = getSelectorOverrides();
    const repaired: RepairSummary["repaired"] = [];
    const stillBroken: string[] = [];
    let healthy = 0;

    const evaluate = (key: SelectorKey, selector: string, active: boolean) =>
        testSelector({
            definition: getSelectorDefinition(key),
            selector,
            found: found.get(key) || [],
            settings,
            active,
            doc,
        });

    for (const definition of SELECTOR_DEFINITIONS) {
        const { key } = definition;
        if (overrides[key]) continue;

        const current = evaluate(key, getActiveSelector(key), true);
        if (current.status !== "fail") {
            if (!definition.optional) healthy += 1;
            continue;
        }

        // Optional targets only exist while their menu or dialog is open.
        if (definition.optional && !(found.get(key) || []).length) continue;

        const target = report.targets.find((item) => item.id === key);
        let accepted: string | null = null;

        for (const candidate of target?.suggestions || []) {
            if (evaluate(key, candidate.selector, false).status !== "pass") {
                continue;
            }

            healed[key] = {
                selector: candidate.selector,
                healedAt: new Date().toISOString(),
            };
            setHealedSelectors(healed, { persist: false });

            if (evaluate(key, getActiveSelector(key), true).status === "pass") {
                accepted = candidate.selector;
                break;
            }

            delete healed[key];
            setHealedSelectors(healed, { persist: false });
        }

        if (accepted) {
            repaired.push({ label: definition.label, selector: accepted });
        } else {
            stillBroken.push(definition.label);
        }
    }

    setHealedSelectors(healed);

    return {
        repaired,
        stillBroken,
        healthy,
        activeRepairs: Object.keys(healed).length,
    };
};
