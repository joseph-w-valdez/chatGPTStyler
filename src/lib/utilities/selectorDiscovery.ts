import {
    asCompound,
    DEFAULT_SELECTORS,
    getSelectorDefinition,
    SELECTOR_DEFINITIONS,
    SelectorDefinition,
    SelectorKey,
    SelectorMap,
} from "@src/shared/selectors";
import { getActiveSelectors } from "./activeSelectors";
import { SCROLL_TO_TOP_MOUNT_ID } from "./chatDom";
import { getSelectorProbes } from "./selectorProbes";

export type CandidateKind =
    | "id"
    | "testid"
    | "testid-prefix"
    | "data-attr"
    | "data-attr-presence"
    | "form-attr"
    | "class"
    | "token-class"
    | "module-class"
    | "aria-label"
    | "role"
    | "tag"
    | "anchored"
    | "composed";

export type SelectorCandidate = {
    selector: string;
    kind: CandidateKind;
    /** Heuristic stability (0-100). Higher is less likely to change between ChatGPT releases. */
    score: number;
    /** Matches in the whole document. */
    count: number;
};

export type RankedCandidate = SelectorCandidate & {
    /** How many of the heuristic target elements this selector matches. */
    coverage: number;
    rank: number;
};

export type ProbeRelation = "self" | "ancestor" | "descendant";

export type ProbeMatch = {
    id: string;
    label: string;
    selector: string;
    relation: ProbeRelation;
};

export type ElementSummary = {
    label: string;
    tag: string;
    attributes: Array<{ name: string; value: string }>;
    classes: string[];
    inlineCustomProperties: Array<{ name: string; value: string }>;
};

export type DiscoveryTarget = {
    id: SelectorKey;
    label: string;
    expect: "one" | "many";
    defaultSelector: string;
    /** Active selector, including any dev override. */
    currentSelector: string;
    overridden: boolean;
    currentCount: number;
    /** Required selector with too few matches. */
    broken: boolean;
    optional: boolean;
    foundElements: number;
    suggestions: RankedCandidate[];
};

export type DiscoveryReport = {
    checkedAt: string;
    href: string;
    targets: DiscoveryTarget[];
    cssVariables: Array<{ name: string; value: string; required: boolean }>;
    inventory: {
        testIds: Array<{ value: string; count: number }>;
        dataAttributes: Array<{ name: string; count: number }>;
        ids: string[];
    };
};

/** Elements the heuristics believe each selector should match. */
export type TargetElements = Map<SelectorKey, Element[]>;

// Values generated per render/session (Radix ids, React useId, UUIDs, hashes).
const DYNAMIC_VALUE_PATTERN =
    /radix-|^:r|_r_|[0-9a-f]{8}-[0-9a-f]{4}-|[0-9a-f]{12,}|\d{5,}/i;

// Tailwind-style utilities churn constantly, so they are never suggested.
const UTILITY_CLASS_PREFIXES = [
    "flex",
    "grid",
    "inline",
    "block",
    "hidden",
    "contents",
    "text-",
    "font-",
    "leading-",
    "tracking-",
    "bg-",
    "from-",
    "to-",
    "via-",
    "border",
    "rounded",
    "ring",
    "outline",
    "shadow",
    "p-",
    "px-",
    "py-",
    "pt-",
    "pb-",
    "pl-",
    "pr-",
    "ps-",
    "pe-",
    "m-",
    "mx-",
    "my-",
    "mt-",
    "mb-",
    "ml-",
    "mr-",
    "ms-",
    "me-",
    "w-",
    "h-",
    "min-",
    "max-",
    "size-",
    "gap-",
    "space-",
    "items-",
    "justify-",
    "self-",
    "place-",
    "content-",
    "order-",
    "col-",
    "row-",
    "basis-",
    "grow",
    "shrink",
    "overflow",
    "z-",
    "top-",
    "left-",
    "right-",
    "bottom-",
    "inset-",
    "start-",
    "end-",
    "opacity-",
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "static",
    "translate-",
    "scale-",
    "rotate-",
    "origin-",
    "transform",
    "transition",
    "duration-",
    "delay-",
    "ease-",
    "animate-",
    "motion-",
    "cursor-",
    "pointer-events",
    "select-",
    "whitespace-",
    "break-",
    "truncate",
    "line-clamp",
    "aspect-",
    "object-",
    "sr-only",
    "not-sr-only",
    "visible",
    "invisible",
    "group",
    "peer",
    "container",
    "prose",
    "dark",
    "light",
    "decoration-",
    "underline",
    "list-",
    "align-",
    "isolate",
    "contain-",
    "will-change",
    "backdrop-",
    "blur",
    "filter",
    "fill-",
    "stroke-",
    "touch-",
    "resize",
    "scroll-",
    "snap-",
    "appearance-",
    "box-",
    "float-",
    "clear-",
    "table",
    "empty",
    "icon",
];

const SEMANTIC_TAGS = new Set([
    "main",
    "nav",
    "aside",
    "header",
    "footer",
    "form",
    "section",
    "article",
    "textarea",
    "dialog",
    "button",
    "a",
]);

const MAX_TARGET_ELEMENTS = 6;
const MAX_SUGGESTIONS = 5;

const isDynamic = (value: string): boolean => DYNAMIC_VALUE_PATTERN.test(value);

// UI-state and design-system attributes appear on dozens of unrelated
// elements (Radix `data-state`, router `data-discover`, `data-d-*` props).
const GENERIC_DATA_ATTRIBUTE =
    /^data-(state|disabled|highlighted|orientation|side|align|color|variant|size|theme|appearance|icon-size|pill|uniform|loaded|saved|discover|placeholder|selected|active|open|expanded|hidden|focus|hover|d-.+|radix-.+|headlessui-.+)$/;

// Role encoded at the end of a compound value: "fallback-turn-0:0:user".
const ROLE_SUFFIX = /([:/_-](?:user|assistant))$/i;

// Values that change with UI/streaming state, so only attribute presence is stable.
const STATE_VALUE =
    /^(true|false|on|off|open|opened|closed|active|inactive|complete|completed|streaming|loading|pending|idle|done|visible|hidden|expanded|collapsed|checked|unchecked|selected|enabled|disabled)$/i;

const escapeIdent = (value: string): string =>
    value.replace(/[^A-Za-z0-9_-]/g, "\\$&");

const escapeAttrValue = (value: string): string =>
    value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const attrEquals = (name: string, value: string): string =>
    `[${name}="${escapeAttrValue(value)}"]`;

const idSelector = (id: string): string =>
    /^[A-Za-z_]/.test(id) ? `#${escapeIdent(id)}` : attrEquals("id", id);

const isUtilityClass = (cls: string): boolean => {
    if (/[:[\]()/!.%#@*=]/.test(cls) || !/^[A-Za-z]/.test(cls)) return true;
    const lower = cls.toLowerCase();
    return UTILITY_CLASS_PREFIXES.some((prefix) =>
        prefix.endsWith("-")
            ? lower.startsWith(prefix)
            : lower === prefix || lower.startsWith(`${prefix}-`),
    );
};

/** "conversation-turn-12" → "conversation-turn-" */
const numericSuffixPrefix = (value: string): string | null => {
    const match = /^(.*?[-_])\d+$/.exec(value);
    return match && match[1].length > 2 ? match[1] : null;
};

const countMatches = (root: ParentNode, selector: string): number => {
    try {
        return root.querySelectorAll(selector).length;
    } catch {
        return -1;
    }
};

const safeMatches = (el: Element, selector: string): boolean => {
    try {
        return el.matches(selector);
    } catch {
        return false;
    }
};

const findStableAnchor = (
    el: Element,
): { selector: string; score: number } | null => {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 12; depth += 1) {
        const tag = node.tagName.toLowerCase();
        if (tag === "body" || tag === "html") return null;

        const id = node.getAttribute("id");
        if (id && !isDynamic(id))
            return { selector: idSelector(id), score: 100 };

        const testId = node.getAttribute("data-testid");
        if (testId && !isDynamic(testId)) {
            return { selector: attrEquals("data-testid", testId), score: 95 };
        }

        node = node.parentElement;
    }
    return null;
};

/** Ranked selector candidates that match `el`, most stable first. */
export const buildSelectorCandidates = (
    el: Element,
    doc: ParentNode = document,
): SelectorCandidate[] => {
    const tag = el.tagName.toLowerCase();
    const raw: Array<Omit<SelectorCandidate, "count">> = [];

    const id = el.getAttribute("id");
    if (id && !isDynamic(id)) {
        raw.push({ selector: idSelector(id), kind: "id", score: 100 });
    }

    for (const { name, value } of Array.from(el.attributes)) {
        if (name === "id" || name === "class" || name === "style") continue;

        if (name === "data-testid") {
            if (value && !isDynamic(value)) {
                raw.push({
                    selector: attrEquals(name, value),
                    kind: "testid",
                    score: 95,
                });
            }
            const prefix = numericSuffixPrefix(value);
            if (prefix) {
                raw.push({
                    selector: `[data-testid^="${escapeAttrValue(prefix)}"]`,
                    kind: "testid-prefix",
                    score: 93,
                });
            }
            continue;
        }

        if (name.startsWith("data-")) {
            if (GENERIC_DATA_ATTRIBUTE.test(name)) continue;

            // "fallback-turn-0" pins one element; "fallback-turn-" matches them all.
            const indexedPrefix = numericSuffixPrefix(value);
            if (indexedPrefix) {
                raw.push({
                    selector: `[${name}^="${escapeAttrValue(indexedPrefix)}"]`,
                    kind: "data-attr",
                    score: 80,
                });
            }

            // "fallback-turn-0:0:user" → every user unit, whatever its index.
            const roleSuffix = ROLE_SUFFIX.exec(value);
            if (roleSuffix) {
                raw.push({
                    selector: `[${name}$="${escapeAttrValue(roleSuffix[1])}"]`,
                    kind: "data-attr",
                    score: 81,
                });
            }

            // Values carrying an index or id identify one element, not a kind.
            if (
                value &&
                value.length <= 40 &&
                !/\d/.test(value) &&
                !isDynamic(value) &&
                !STATE_VALUE.test(value)
            ) {
                raw.push({
                    selector: attrEquals(name, value),
                    kind: "data-attr",
                    score: 82,
                });
            }
            raw.push({
                selector: `[${name}]`,
                kind: "data-attr-presence",
                score: 74,
            });
            continue;
        }

        if (
            ["name", "placeholder", "type", "contenteditable"].includes(name) &&
            value &&
            value.length <= 60 &&
            !isDynamic(value) &&
            // Nearly every button is type="button", so it identifies nothing.
            !(name === "type" && value === "button")
        ) {
            raw.push({
                selector: `${tag}${attrEquals(name, value)}`,
                kind: "form-attr",
                score: name === "name" ? 66 : 55,
            });
            continue;
        }

        // Localized text, so it breaks for non-English users.
        if (name === "aria-label" && value && value.length <= 60) {
            raw.push({
                selector: `${tag}${attrEquals(name, value)}`,
                kind: "aria-label",
                score: 50,
            });
            continue;
        }

        if (name === "role" && value) {
            raw.push({
                selector: `${tag}${attrEquals(name, value)}`,
                kind: "role",
                score: 45,
            });
        }
    }

    for (const cls of Array.from(el.classList)) {
        // CSS-module classes: the hash prefix changes per build, the name usually does not.
        const moduleClass = /^[A-Za-z0-9]{5,8}_([A-Za-z][\w-]{3,})$/.exec(cls);
        if (moduleClass) {
            raw.push({
                selector: `[class*="_${escapeAttrValue(moduleClass[1])}"]`,
                kind: "module-class",
                score: 58,
            });
            continue;
        }

        // Newer CSS modules put the hash last: "bubble-vBnidZ", "Layout-SYw9n4".
        const suffixHashed = /^([A-Za-z][A-Za-z0-9]*)-([A-Za-z0-9_]{6})$/.exec(
            cls,
        );
        if (suffixHashed && /[A-Z0-9_]/.test(suffixHashed[2])) {
            raw.push({
                selector: `[class*="${escapeAttrValue(suffixHashed[1])}-"]`,
                kind: "module-class",
                score: 56,
            });
            continue;
        }

        // Tailwind named groups ("group/scroll-to-bottom") carry semantic names.
        if (/^(group|peer)\/[a-z][\w-]+$/.test(cls)) {
            raw.push({
                selector: `[class~="${escapeAttrValue(cls)}"]`,
                kind: "class",
                score: 64,
            });
            continue;
        }

        if (cls.includes("-token-") || /\(--[\w-]+\)/.test(cls)) {
            raw.push({
                selector: `.${escapeIdent(cls)}`,
                kind: "token-class",
                score: 60,
            });
            continue;
        }

        if (!isUtilityClass(cls) && !isDynamic(cls)) {
            raw.push({
                selector: `.${escapeIdent(cls)}`,
                kind: "class",
                score: 62,
            });
        }
    }

    if (SEMANTIC_TAGS.has(tag)) {
        raw.push({ selector: tag, kind: "tag", score: 40 });
    }

    const anchor = findStableAnchor(el);
    if (anchor) {
        raw.push({
            selector: `${anchor.selector} ${tag}`,
            kind: "anchored",
            score: Math.min(anchor.score, 80) - 15,
        });
    }

    const seen = new Set<string>();
    const candidates: SelectorCandidate[] = [];
    for (const candidate of raw) {
        if (seen.has(candidate.selector)) continue;
        seen.add(candidate.selector);

        const count = countMatches(doc, candidate.selector);
        if (count <= 0 || !safeMatches(el, candidate.selector)) continue;
        candidates.push({ ...candidate, count });
    }

    return candidates.sort((a, b) => b.score - a.score || a.count - b.count);
};

/** Extension selectors that hit `el` itself, one of its ancestors, or a descendant. */
export const matchProbes = (el: Element): ProbeMatch[] => {
    const matches: ProbeMatch[] = [];
    for (const probe of getSelectorProbes()) {
        let relation: ProbeRelation | null = null;
        try {
            if (el.matches(probe.selector)) relation = "self";
            else if (el.parentElement?.closest(probe.selector))
                relation = "ancestor";
            else if (el.querySelector(probe.selector)) relation = "descendant";
        } catch {
            relation = null;
        }
        if (relation) {
            matches.push({
                id: probe.id,
                label: probe.label,
                selector: probe.selector,
                relation,
            });
        }
    }
    return matches;
};

/** Short human label, e.g. `section[data-turn="user"]` or `div.user-message-bubble-color`. */
export const describeElementShort = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const id = el.getAttribute("id");
    if (id && !isDynamic(id)) return `${tag}#${id}`;

    const testId = el.getAttribute("data-testid");
    if (testId) return `${tag}[data-testid="${testId}"]`;

    const dataAttr = Array.from(el.attributes).find(
        (attr) => attr.name.startsWith("data-") && attr.value.length <= 24,
    );
    if (dataAttr) {
        return dataAttr.value
            ? `${tag}[${dataAttr.name}="${dataAttr.value}"]`
            : `${tag}[${dataAttr.name}]`;
    }

    const cls = Array.from(el.classList).find(
        (name) => !isUtilityClass(name) && !isDynamic(name),
    );
    return cls ? `${tag}.${cls}` : tag;
};

export const describeElement = (el: Element): ElementSummary => {
    const style = el.getAttribute("style") || "";
    const inlineCustomProperties: ElementSummary["inlineCustomProperties"] = [];
    const customPropertyPattern = /(--[\w-]+)\s*:\s*([^;]+)/g;
    let match = customPropertyPattern.exec(style);
    while (match) {
        inlineCustomProperties.push({ name: match[1], value: match[2].trim() });
        match = customPropertyPattern.exec(style);
    }

    return {
        label: describeElementShort(el),
        tag: el.tagName.toLowerCase(),
        attributes: Array.from(el.attributes)
            .filter((attr) => attr.name !== "class" && attr.name !== "style")
            .map((attr) => ({
                name: attr.name,
                value:
                    attr.value.length > 80
                        ? `${attr.value.slice(0, 77)}...`
                        : attr.value,
            })),
        classes: Array.from(el.classList).slice(0, 40),
        inlineCustomProperties,
    };
};

/** Ancestors nearest-first, excluding <body>/<html>. */
export const getAncestors = (el: Element, max = 8): Element[] => {
    const ancestors: Element[] = [];
    let node = el.parentElement;
    while (node && ancestors.length < max) {
        const tag = node.tagName.toLowerCase();
        if (tag === "body" || tag === "html") break;
        ancestors.push(node);
        node = node.parentElement;
    }
    return ancestors;
};

type FinderContext = {
    doc: Document;
    elements: Element[];
    roleNodes: Element[];
};

type Finder = (ctx: FinderContext) => Element[];

const ROLE_VALUE = /^(user|assistant)$/i;

const hasAttribute = (
    el: Element,
    test: (name: string, value: string) => boolean,
): boolean =>
    Array.from(el.attributes).some(
        ({ name, value }) =>
            name !== "class" && name !== "style" && test(name, value),
    );

// Role can also be encoded in the attribute name, e.g. `data-user-message-bubble`.
const USER_MARKER = /user-message|user-turn|user-bubble/i;
const ASSISTANT_MARKER = /assistant-message|assistant-turn|agent-turn/i;

const roleValue = (el: Element): string | null => {
    for (const { name, value } of Array.from(el.attributes)) {
        if (name === "class" || name === "style") continue;
        if (ROLE_VALUE.test(value)) return value.toLowerCase();
        const suffix = ROLE_SUFFIX.exec(value);
        if (suffix) return suffix[1].slice(1).toLowerCase();
        if (USER_MARKER.test(name)) return "user";
        if (ASSISTANT_MARKER.test(name)) return "assistant";
    }
    return null;
};

/** Drops elements nested inside another element of the same list. */
const outermost = (elements: Element[]): Element[] =>
    elements.filter(
        (el) => !elements.some((other) => other !== el && other.contains(el)),
    );

/**
 * Per-message containers whose role is encoded as a value suffix
 * ("fallback-turn-0:0:user"), i.e. one side of an exchange.
 */
const findRoleUnits = (ctx: FinderContext, role: string): Element[] =>
    outermost(
        ctx.roleNodes.filter(
            (el) =>
                roleValue(el) === role &&
                hasAttribute(el, (_name, value) => ROLE_SUFFIX.test(value)),
        ),
    );

const isUserBubble = (el: Element): boolean =>
    hasAttribute(el, (name) => /message-bubble/i.test(name)) ||
    Array.from(el.classList).some((cls) => /user-message-bubble/i.test(cls));

const findUserBubbles: Finder = ({ elements, roleNodes }) =>
    unique([
        ...elements.filter(isUserBubble),
        ...roleNodes
            .filter((el) => roleValue(el) === "user")
            .flatMap((el) =>
                Array.from(el.querySelectorAll("*")).filter((child) =>
                    Array.from(child.classList).some((cls) =>
                        /bubble/i.test(cls),
                    ),
                ),
            ),
    ]);

/** A turn's own role marker, or the first role marker inside it. */
const turnRole = (el: Element): string | null => {
    const own = roleValue(el);
    if (own) return own;
    const marked = Array.from(el.querySelectorAll("*")).find(
        (child) => roleValue(child) !== null,
    );
    return marked ? roleValue(marked) : null;
};

const textOf = (el: Element): string => (el.textContent || "").trim();

const unique = (elements: Array<Element | null | undefined>): Element[] =>
    Array.from(new Set(elements.filter((el): el is Element => Boolean(el))));

// Turns nest several "turn" attributes (keys, streaming state, hidden
// markers); only the outermost element per turn is the turn itself.
const findTurns: Finder = ({ elements, roleNodes }) =>
    outermost(
        unique([
            ...elements.filter((el) =>
                hasAttribute(
                    el,
                    (name, value) =>
                        /turn/i.test(name) || /conversation-turn/i.test(value),
                ),
            ),
            ...roleNodes.map((el) => el.closest("article, section")),
        ]),
    );

const findComposerForms: Finder = ({ doc, elements }) =>
    unique([
        ...Array.from(
            doc.querySelectorAll('[contenteditable="true"], textarea'),
        ).map((el) => el.closest("form")),
        ...elements.filter((el) =>
            hasAttribute(
                el,
                (name, value) =>
                    /composer/i.test(name) ||
                    (name.startsWith("data-") && /composer/i.test(value)),
            ),
        ),
    ]);

// The utility ChatGPT uses to cap the thread and composer column width.
const CAP_CLASS = /max-w-\(--thread-(body|content)-max-width\)/;

const findDialogButtons = (
    doc: Document,
    test: (button: Element) => boolean,
): Element[] =>
    Array.from(
        doc.querySelectorAll(
            '[role="dialog"] button, [role="alertdialog"] button',
        ),
    ).filter(test);

const FINDERS: Partial<Record<SelectorKey, Finder>> = {
    messageTurn: findTurns,
    // A turn may be one message (older layouts) or a whole exchange (app-shell
    // layout), so prefer per-message role units, then role-tagged turns.
    userTurn: (ctx) => {
        const units = findRoleUnits(ctx, "user");
        if (units.length) return units;
        const bubbles = findUserBubbles(ctx);
        return findTurns(ctx).filter(
            (turn) =>
                turnRole(turn) === "user" &&
                bubbles.some((bubble) => turn.contains(bubble)),
        );
    },
    assistantTurn: (ctx) => {
        const units = findRoleUnits(ctx, "assistant");
        if (units.length) return units;
        const bubbles = findUserBubbles(ctx);
        return findTurns(ctx).filter(
            (turn) =>
                turnRole(turn) === "assistant" &&
                !bubbles.some((bubble) => turn.contains(bubble)),
        );
    },
    userBubble: findUserBubbles,
    assistantMessage: ({ elements, roleNodes }) =>
        unique([
            // e.g. data-markdown-text-style="assistant-message"
            ...elements.filter((el) =>
                hasAttribute(el, (_name, value) =>
                    /assistant[-_]message$/i.test(value),
                ),
            ),
            ...roleNodes.filter(
                (el) =>
                    roleValue(el) === "assistant" &&
                    hasAttribute(
                        el,
                        (name, value) =>
                            /author/i.test(name) && ROLE_VALUE.test(value),
                    ),
            ),
        ]),
    turnContentWidthCap: (ctx) => {
        const firstTurn = findTurns(ctx)[0];
        // App-shell layout: one capped column wrapping every turn.
        const columns = firstTurn
            ? ctx.elements.filter(
                  (el) =>
                      el !== firstTurn &&
                      el.contains(firstTurn) &&
                      CAP_CLASS.test(el.getAttribute("class") || ""),
              )
            : [];
        // Older layouts: a capped block inside each turn.
        const perTurn = findTurns(ctx)
            .slice(0, MAX_TARGET_ELEMENTS)
            .flatMap((turn) =>
                Array.from(turn.querySelectorAll("*")).filter((el) =>
                    hasAttribute(el, (name) =>
                        /screenshot-content/i.test(name),
                    ),
                ),
            );
        return unique([...columns.reverse(), ...perTurn]);
    },
    composerWidthCap: (ctx) =>
        unique(
            findComposerForms(ctx)
                .filter((el) => el.tagName === "FORM")
                .flatMap((form) => getAncestors(form, 12))
                .filter((el) => CAP_CLASS.test(el.getAttribute("class") || "")),
        ),
    composerForm: findComposerForms,
    composerSubmit: ({ doc }) =>
        Array.from(doc.querySelectorAll("button")).filter(
            (button) =>
                button.getAttribute("type") === "submit" ||
                /send|submit/i.test(button.getAttribute("aria-label") || "") ||
                /send|submit/i.test(button.getAttribute("data-testid") || "") ||
                /submit/i.test(button.id),
        ),
    conversationMain: ({ doc }) =>
        Array.from(doc.querySelectorAll('main, [role="main"]')),
    // The panel itself, not the dozens of `sidebar-item` rows inside it.
    sidebarSurface: ({ doc, elements }) =>
        unique([
            ...Array.from(doc.querySelectorAll("aside")),
            ...elements.filter(
                (el) =>
                    /sidebar/i.test(el.id) ||
                    Array.from(el.classList).some((cls) =>
                        /left-panel|sidebar-surface/i.test(cls),
                    ),
            ),
            ...Array.from(doc.querySelectorAll('a[href*="/c/"]'))
                .slice(0, 1)
                .map((link) => link.closest("aside") || link.closest("nav")),
        ]),
    scrollRoot: ({ doc, elements }) => {
        // Named scrollers still count when a short chat does not overflow yet.
        const scrollerName =
            /scroll-?root|scroll-?container|scrollport|scroll-?area/i;
        const scrollAttr = elements.filter(
            (el) =>
                hasAttribute(el, (name) => scrollerName.test(name)) ||
                Array.from(el.classList).some((cls) => scrollerName.test(cls)),
        );
        const main = doc.querySelector("main") || doc.body;
        const scrollable = Array.from(main.querySelectorAll("*"))
            .filter(
                (el) =>
                    el.clientHeight > 100 &&
                    el.scrollHeight > el.clientHeight + 20 &&
                    /auto|scroll/.test(getComputedStyle(el).overflowY),
            )
            .sort((a, b) => b.scrollHeight - a.scrollHeight)
            .slice(0, 2);
        return unique([...scrollable, ...scrollAttr]);
    },
    scrollControlHost: ({ elements }) =>
        unique([
            ...elements.filter((el) =>
                /scroll-to-bottom/i.test(el.getAttribute("style") || ""),
            ),
            ...elements
                .filter(
                    (el) =>
                        el.tagName === "BUTTON" &&
                        el.id !== "scroll-to-top-btn" &&
                        (/scroll|bottom/i.test(
                            el.getAttribute("aria-label") || "",
                        ) ||
                            /scroll-root|scroll-from-end|scroll-to-bottom/i.test(
                                el.getAttribute("class") || "",
                            )),
                )
                .map((button) => button.parentElement),
        ]),
    chatHistory: ({ doc }) =>
        Array.from(
            doc.querySelectorAll('nav a[href*="/c/"], aside a[href*="/c/"]'),
        ),
    profileButton: ({ elements }) =>
        elements.filter(
            (el) =>
                !el.closest("[inert]") &&
                (/profile|account/i.test(
                    el.getAttribute("data-testid") || "",
                ) ||
                    (el.tagName === "BUTTON" &&
                        /profile|account|user menu/i.test(
                            el.getAttribute("aria-label") || "",
                        ))),
        ),
    settingsMenuItem: ({ doc }) =>
        Array.from(
            doc.querySelectorAll('[role="menuitem"], [data-testid]'),
        ).filter(
            (el) =>
                /settings/i.test(el.getAttribute("data-testid") || "") ||
                (el.getAttribute("role") === "menuitem" &&
                    /^settings$/i.test(textOf(el))),
        ),
    dataControlsTab: ({ doc }) =>
        Array.from(doc.querySelectorAll('[role="tab"], [data-testid]')).filter(
            (el) =>
                /data-controls/i.test(el.getAttribute("data-testid") || "") ||
                (el.getAttribute("role") === "tab" &&
                    /data controls/i.test(textOf(el))),
        ),
    deleteAllButton: ({ doc }) =>
        findDialogButtons(doc, (button) =>
            /^delete all/i.test(
                button.getAttribute("aria-label") || textOf(button),
            ),
        ),
    confirmDeleteButton: ({ doc }) =>
        findDialogButtons(
            doc,
            (button) =>
                /confirm.*delete|delete.*confirm/i.test(
                    button.getAttribute("data-testid") || "",
                ) ||
                (/^(delete|confirm|confirm deletion)$/i.test(textOf(button)) &&
                    !/delete all/i.test(
                        button.getAttribute("aria-label") || "",
                    )),
        ),
};

/** Run every heuristic finder once; reused when testing workbench drafts. */
export const findTargetElements = (
    doc: Document = document,
): TargetElements => {
    const elements = doc.body ? Array.from(doc.body.querySelectorAll("*")) : [];
    const ctx: FinderContext = {
        doc,
        elements,
        roleNodes: elements.filter((el) => roleValue(el) !== null),
    };

    const found: TargetElements = new Map();
    for (const definition of SELECTOR_DEFINITIONS) {
        const finder = FINDERS[definition.key];
        found.set(definition.key, finder ? finder(ctx) : []);
    }
    return found;
};

/** Candidates from a sample of the found elements, deduped by selector. */
const collectCandidates = (
    targetElements: Element[],
    doc: Document,
): SelectorCandidate[] => {
    const merged = new Map<string, SelectorCandidate>();
    for (const el of targetElements.slice(0, MAX_TARGET_ELEMENTS)) {
        for (const candidate of buildSelectorCandidates(el, doc)) {
            const existing = merged.get(candidate.selector);
            if (!existing || existing.score < candidate.score) {
                merged.set(candidate.selector, candidate);
            }
        }
    }
    return Array.from(merged.values());
};

const composeHas = (
    outer: SelectorCandidate | undefined,
    inner: SelectorCandidate | undefined,
    doc: Document,
): SelectorCandidate | null => {
    if (!outer || !inner) return null;
    const selector = `${asCompound(outer.selector)}:has(${inner.selector})`;
    const count = countMatches(doc, selector);
    if (count <= 0) return null;
    return {
        selector,
        kind: "composed",
        score: Math.min(outer.score, inner.score) - 4,
        count,
    };
};

/** Matches at least twice what the heuristics found, e.g. every turn for "user turns". */
export const isImprecise = (count: number, found: number): boolean =>
    found >= 2 && count >= found * 2 && count - found >= 2;

const rankForTarget = (
    candidates: SelectorCandidate[],
    found: Element[],
    definition: SelectorDefinition,
): RankedCandidate[] =>
    candidates
        .map((candidate) => {
            const matchedIndexes = found
                .map((el, index) =>
                    safeMatches(el, candidate.selector) ? index : -1,
                )
                .filter((index) => index !== -1);
            const coverage = matchedIndexes.length;
            let fit: number;

            if (definition.expect === "many") {
                fit = Math.round((coverage / found.length) * 25);
                if (isImprecise(candidate.count, found.length)) fit -= 15;
                if (candidate.count > found.length * 4 + 4) fit -= 20;
            } else {
                const expectMax = definition.expectMax ?? 1;
                fit =
                    candidate.count <= expectMax
                        ? 12
                        : -Math.min(30, (candidate.count - expectMax) * 6);
                // Finders list their most confident element first.
                const firstMatch = matchedIndexes.length
                    ? Math.min(...matchedIndexes)
                    : found.length;
                fit -= Math.min(firstMatch, 5) * 6;
            }

            return { ...candidate, coverage, rank: candidate.score + fit };
        })
        .sort((a, b) => b.rank - a.rank || a.count - b.count);

const collectCssVariables = (
    doc: Document,
): DiscoveryReport["cssVariables"] => {
    const required = ["--main-surface-primary", "--sidebar-surface-primary"];
    const variables = new Map<string, string>();
    const rootStyle = getComputedStyle(doc.documentElement);

    for (const name of required) {
        variables.set(name, rootStyle.getPropertyValue(name).trim());
    }

    // Chromium enumerates custom properties on computed styles; jsdom does not.
    for (const el of [doc.documentElement, doc.body]) {
        if (!el) continue;
        const style = getComputedStyle(el);
        for (let index = 0; index < style.length; index += 1) {
            const name = style[index];
            if (
                name.startsWith("--") &&
                /surface|sidebar|thread|composer/i.test(name) &&
                !variables.has(name)
            ) {
                variables.set(name, style.getPropertyValue(name).trim());
            }
        }
    }

    return Array.from(variables, ([name, value]) => ({
        name,
        value,
        required: required.includes(name),
    }));
};

const buildInventory = (doc: Document): DiscoveryReport["inventory"] => {
    const elements = doc.body ? Array.from(doc.body.querySelectorAll("*")) : [];
    const testIds = new Map<string, number>();
    const dataAttributes = new Map<string, number>();
    const ids = new Set<string>();

    for (const el of elements) {
        for (const { name, value } of Array.from(el.attributes)) {
            if (name === "data-testid") {
                const normalized = value.replace(/\d+/g, "*");
                testIds.set(normalized, (testIds.get(normalized) || 0) + 1);
            } else if (name.startsWith("data-")) {
                dataAttributes.set(name, (dataAttributes.get(name) || 0) + 1);
            } else if (name === "id" && !isDynamic(value)) {
                ids.add(value);
            }
        }
    }

    const sortByCount = (map: Map<string, number>): Array<[string, number]> =>
        Array.from(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 80);

    return {
        testIds: sortByCount(testIds).map(([value, count]) => ({
            value,
            count,
        })),
        dataAttributes: sortByCount(dataAttributes).map(([name, count]) => ({
            name,
            count,
        })),
        ids: Array.from(ids).sort().slice(0, 120),
    };
};

/**
 * Heuristically locate each ChatGPT surface the extension depends on and
 * suggest selectors for it, independent of whether current selectors still match.
 */
export const discoverSelectors = (
    doc: Document = document,
    found: TargetElements = findTargetElements(doc),
    selectors: SelectorMap = getActiveSelectors(),
): DiscoveryReport => {
    const pools = new Map<SelectorKey, SelectorCandidate[]>();
    for (const definition of SELECTOR_DEFINITIONS) {
        pools.set(
            definition.key,
            collectCandidates(found.get(definition.key) || [], doc),
        );
    }

    const best = (key: SelectorKey): SelectorCandidate | undefined => {
        const targetElements = found.get(key) || [];
        return targetElements.length
            ? rankForTarget(
                  pools.get(key) || [],
                  targetElements,
                  getSelectorDefinition(key),
              )[0]
            : undefined;
    };

    // Role-specific turns often share every attribute with the other role's
    // turns; `turn:has(marker)` is then the only way to tell them apart.
    const turn = best("messageTurn");
    const roleMarkers: Array<[SelectorKey, SelectorKey]> = [
        ["userTurn", "userBubble"],
        ["assistantTurn", "assistantMessage"],
    ];
    for (const [roleKey, markerKey] of roleMarkers) {
        const composed = composeHas(turn, best(markerKey), doc);
        if (composed) pools.get(roleKey)?.push(composed);
    }

    // Mount hosts are often anonymous wrappers; identify them by what they wrap.
    const hostPool = pools.get("scrollControlHost");
    for (const host of (found.get("scrollControlHost") || []).slice(0, 3)) {
        const tag = host.tagName.toLowerCase();
        for (const child of Array.from(host.children).slice(0, 4)) {
            if (child.id === SCROLL_TO_TOP_MOUNT_ID) continue;
            for (const candidate of buildSelectorCandidates(child, doc).slice(
                0,
                3,
            )) {
                const selector = `${tag}:has(> ${candidate.selector})`;
                const count = countMatches(doc, selector);
                if (count > 0 && safeMatches(host, selector)) {
                    hostPool?.push({
                        selector,
                        kind: "composed",
                        score: candidate.score - 4,
                        count,
                    });
                }
            }
        }
    }

    const targets = SELECTOR_DEFINITIONS.map((definition): DiscoveryTarget => {
        const currentSelector = selectors[definition.key];
        const currentCount = Math.max(0, countMatches(doc, currentSelector));
        const targetElements = found.get(definition.key) || [];

        return {
            id: definition.key,
            label: definition.label,
            expect: definition.expect,
            defaultSelector: DEFAULT_SELECTORS[definition.key],
            currentSelector,
            overridden: currentSelector !== DEFAULT_SELECTORS[definition.key],
            currentCount,
            broken:
                !definition.optional && currentCount < definition.expectAtLeast,
            optional: Boolean(definition.optional),
            foundElements: targetElements.length,
            suggestions: targetElements.length
                ? rankForTarget(
                      pools.get(definition.key) || [],
                      targetElements,
                      definition,
                  ).slice(0, MAX_SUGGESTIONS)
                : [],
        };
    });

    return {
        checkedAt: new Date().toISOString(),
        href: doc.location ? doc.location.href : "",
        targets,
        cssVariables: collectCssVariables(doc),
        inventory: buildInventory(doc),
    };
};
