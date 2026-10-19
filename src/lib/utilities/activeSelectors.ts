import {
    DEFAULT_SELECTORS,
    getSelectorDefinition,
    isSelectorKey,
    joinSelectors,
    SELECTOR_DEFINITIONS,
    selectorChain,
    SelectorKey,
    SelectorMap,
} from "@src/shared/selectors";

/** Dev-only selector swaps from the inspector workbench; production never loads them. */
export const SELECTOR_OVERRIDES_STORAGE_KEY = "devSelectorOverrides";

/** Dev-only selectors found by "Repair layout"; production never loads them. */
export const HEALED_SELECTORS_STORAGE_KEY = "healedSelectors";

export type SelectorOverrides = Partial<SelectorMap>;

export type HealedSelector = { selector: string; healedAt: string };

export type HealedSelectors = Partial<Record<SelectorKey, HealedSelector>>;

/** Matches nothing; stands in for a selector ChatGPT has broken. */
const SIMULATED_BREAK_SELECTOR = "[data-chatgpt-styler-simulated-break]";

let overrides: SelectorOverrides = {};
let healed: HealedSelectors = {};
// Dev-only drill state, in memory so a page reload always undoes it.
let simulatedBreaks = new Set<SelectorKey>();
const listeners = new Set<() => void>();

const notify = (): void => {
    listeners.forEach((listener) => listener());
};

const persist = (key: string, value: Record<string, unknown>): void => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return;
    if (Object.keys(value).length) {
        chrome.storage.local.set({ [key]: value });
    } else {
        chrome.storage.local.remove(key);
    }
};

/**
 * Splits a selector list on top-level commas only, so `:is(a, b)`,
 * `:has(a, b)`, and quoted attribute values stay intact.
 */
export const splitSelectorList = (selector: string): string[] => {
    const parts: string[] = [];
    let depth = 0;
    let quote: string | null = null;
    let current = "";

    for (const char of selector) {
        if (quote) {
            if (char === quote) quote = null;
        } else if (char === '"' || char === "'") {
            quote = char;
        } else if (char === "(" || char === "[") {
            depth += 1;
        } else if (char === ")" || char === "]") {
            depth -= 1;
        } else if (char === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }
    parts.push(current.trim());

    return parts.filter(Boolean);
};

const sanitizeOverrides = (value: unknown): SelectorOverrides => {
    if (!value || typeof value !== "object") return {};

    const next: SelectorOverrides = {};
    for (const [key, selector] of Object.entries(
        value as Record<string, unknown>,
    )) {
        if (
            isSelectorKey(key) &&
            typeof selector === "string" &&
            selector.trim() &&
            selector.trim() !== DEFAULT_SELECTORS[key]
        ) {
            next[key] = selector.trim();
        }
    }
    return next;
};

const sanitizeHealed = (value: unknown): HealedSelectors => {
    if (!value || typeof value !== "object") return {};

    const next: HealedSelectors = {};
    for (const [key, entry] of Object.entries(
        value as Record<string, unknown>,
    )) {
        const selector =
            entry && typeof entry === "object"
                ? (entry as Partial<HealedSelector>).selector
                : undefined;
        if (
            isSelectorKey(key) &&
            typeof selector === "string" &&
            selector.trim()
        ) {
            next[key] = {
                selector: selector.trim(),
                healedAt: String(
                    (entry as Partial<HealedSelector>).healedAt || "",
                ),
            };
        }
    }
    return next;
};

/**
 * Selectors to try for `key`, in priority order. A dev override replaces the
 * list outright so it can be tested in isolation; otherwise a repaired
 * selector is tried before the registry's known-good variants.
 */
export const getSelectorAlternatives = (key: SelectorKey): string[] => {
    const override = overrides[key];
    if (override) return splitSelectorList(override);

    const repaired = healed[key];
    const builtIns = simulatedBreaks.has(key)
        ? [SIMULATED_BREAK_SELECTOR]
        : selectorChain(getSelectorDefinition(key)).flatMap(splitSelectorList);
    return Array.from(
        new Set([
            ...(repaired ? splitSelectorList(repaired.selector) : []),
            ...builtIns,
        ]),
    );
};

export const getSimulatedBreaks = (): SelectorKey[] =>
    Array.from(simulatedBreaks);

/**
 * Dev-only repair drill: replaces each key's built-in variants with a
 * selector that matches nothing, as if ChatGPT renamed the markup. Unlike an
 * override, Repair treats these as genuinely broken and tries to heal them.
 */
export const setSimulatedBreaks = (keys: SelectorKey[]): void => {
    simulatedBreaks = new Set(keys);
    notify();
};

/** Union of every alternative; what generated CSS and probes use. */
export const getActiveSelector = (key: SelectorKey): string =>
    joinSelectors(getSelectorAlternatives(key));

export const getActiveSelectors = (): SelectorMap =>
    SELECTOR_DEFINITIONS.reduce(
        (map, definition) => ({
            ...map,
            [definition.key]: getActiveSelector(definition.key),
        }),
        {} as SelectorMap,
    );

const querySafe = <T>(run: () => T, fallback: T): T => {
    try {
        return run();
    } catch {
        return fallback;
    }
};

/** First element matched by the highest-priority alternative that matches anything. */
export const queryActive = (
    key: SelectorKey,
    root: ParentNode = document,
): Element | null => {
    for (const selector of getSelectorAlternatives(key)) {
        const match = querySafe(() => root.querySelector(selector), null);
        if (match) return match;
    }
    return null;
};

/** All elements for the highest-priority alternative that matches anything. */
export const queryAllActive = (
    key: SelectorKey,
    root: ParentNode = document,
): Element[] => {
    for (const selector of getSelectorAlternatives(key)) {
        const matches = querySafe(
            () => Array.from(root.querySelectorAll(selector)),
            [] as Element[],
        );
        if (matches.length) return matches;
    }
    return [];
};

export const getSelectorOverrides = (): SelectorOverrides => ({ ...overrides });

export const setSelectorOverrides = (next: SelectorOverrides): void => {
    overrides = sanitizeOverrides(next);
    persist(SELECTOR_OVERRIDES_STORAGE_KEY, overrides);
    notify();
};

export const getHealedSelectors = (): HealedSelectors => ({ ...healed });

/** `persist: false` lets Repair trial a candidate before committing it. */
export const setHealedSelectors = (
    next: HealedSelectors,
    options: { persist?: boolean } = {},
): void => {
    healed = sanitizeHealed(next);
    if (options.persist !== false) {
        persist(HEALED_SELECTORS_STORAGE_KEY, healed);
    }
    notify();
};

export const loadSelectorOverrides = (): void => {
    chrome.storage.local.get([SELECTOR_OVERRIDES_STORAGE_KEY], (result) => {
        overrides = sanitizeOverrides(result[SELECTOR_OVERRIDES_STORAGE_KEY]);
        if (Object.keys(overrides).length) notify();
    });
};

export const loadHealedSelectors = (): void => {
    chrome.storage.local.get([HEALED_SELECTORS_STORAGE_KEY], (result) => {
        healed = sanitizeHealed(result[HEALED_SELECTORS_STORAGE_KEY]);
        if (Object.keys(healed).length) notify();
    });
};

/** Fires when dev overrides or repaired selectors change. */
export const onActiveSelectorsChange = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};
