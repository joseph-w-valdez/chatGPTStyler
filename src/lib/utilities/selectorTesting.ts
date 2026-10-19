import { Settings } from "@src/shared/settings";
import { SelectorDefinition, SelectorKey } from "@src/shared/selectors";
import { SCROLL_TO_TOP_MOUNT_ID } from "./chatDom";
import { isImprecise } from "./selectorDiscovery";

export type SelectorTestStatus = "pass" | "warn" | "fail";

export type EffectCheck = {
    status: SelectorTestStatus | "skipped";
    detail: string;
};

export type SelectorTestResult = {
    selector: string;
    valid: boolean;
    count: number;
    /** Heuristic target elements the selector matched. */
    coverage: number;
    foundElements: number;
    status: SelectorTestStatus;
    messages: string[];
    /** Whether the extension's styling/integration really took hold. Only for active selectors. */
    effect: EffectCheck | null;
};

type Verifier = (matched: HTMLElement[], settings: Settings) => EffectCheck;

const MAX_VERIFIED = 12;
const SEVERITY: Record<SelectorTestStatus, number> = {
    pass: 0,
    warn: 1,
    fail: 2,
};

const hexToRgb = (hex: string): string | null => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;
    const digits =
        match[1].length === 3
            ? match[1]
                  .split("")
                  .map((char) => char + char)
                  .join("")
            : match[1];
    const value = Number.parseInt(digits, 16);
    return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
};

/** False in jsdom, where every box is 0×0; visibility checks need real layout. */
const hasLayout = (doc: Document = document): boolean =>
    doc.documentElement.getBoundingClientRect().width > 0;

const HIDDEN_CLASS = /(^|\s)(sr-only|visually-hidden|screen-reader-only)(\s|$)/;
const ZERO_CLIP = /rect\(\s*0(px)?[,\s]+0(px)?[,\s]+0(px)?[,\s]+0(px)?\s*\)/;

/**
 * Screen-reader-only labels and `hidden` markers can carry the right
 * attributes but show nothing. Size alone is not enough: the extension's own
 * padding can grow a clipped 1×1 label to 20×20. A 0-height positioned
 * wrapper still counts as present.
 */
const isVisuallyPresent = (el: Element): boolean => {
    if (HIDDEN_CLASS.test(el.getAttribute("class") || "")) return false;
    if (el.closest("[hidden]")) return false;

    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (ZERO_CLIP.test(style.getPropertyValue("clip"))) return false;
    if (/^inset\(\s*50%/.test(style.getPropertyValue("clip-path")))
        return false;

    const rect = el.getBoundingClientRect();
    return rect.width >= 4 || rect.height >= 4;
};

const verifyEach = (
    matched: HTMLElement[],
    predicate: (el: HTMLElement) => boolean,
    description: string,
): EffectCheck => {
    const visible = hasLayout() ? matched.filter(isVisuallyPresent) : matched;
    if (matched.length && !visible.length) {
        return { status: "fail", detail: "every match is visually hidden" };
    }
    const sample = visible.slice(0, MAX_VERIFIED);
    if (!sample.length)
        return { status: "skipped", detail: "Nothing to verify" };
    const passed = sample.filter(predicate).length;
    return {
        status:
            passed === sample.length ? "pass" : passed > 0 ? "warn" : "fail",
        detail: `${passed}/${sample.length} ${description}`,
    };
};

const colorVerifier =
    (colorOf: (settings: Settings) => string, description: string): Verifier =>
    (matched, settings) => {
        const color = colorOf(settings);
        const expected = hexToRgb(color);
        if (!expected) {
            return { status: "skipped", detail: `${color} is not a hex color` };
        }
        return verifyEach(
            matched,
            (el) => getComputedStyle(el).backgroundColor === expected,
            `${description} ${color}`,
        );
    };

// A max-width alone proves nothing: a flex item with auto margins shrinks to
// its content and never reaches the cap.
const COMPOSER_MIN_WIDTH_PX = 300;
const rendersAtWidthPercent = (el: Element, percent: string): boolean => {
    const parent = el.parentElement;
    if (!hasLayout() || !parent) return true;
    const available = parent.clientWidth;
    const expected = Math.min(
        available,
        Math.max(
            COMPOSER_MIN_WIDTH_PX,
            (available * Number.parseFloat(percent)) / 100,
        ),
    );
    return Math.abs(el.getBoundingClientRect().width - expected) <= 4;
};

const widthCapRemoved: Verifier = (matched) =>
    verifyEach(
        matched,
        (el) => getComputedStyle(el).maxWidth === "none",
        "have ChatGPT's width cap removed",
    );

const VERIFIERS: Partial<Record<SelectorKey, Verifier>> = {
    userBubble: colorVerifier(
        (settings) => settings.messageColorUserStyle,
        "show the user bubble color",
    ),
    assistantMessage: colorVerifier(
        (settings) => settings.messageColorNonUserStyle,
        "show the ChatGPT bubble color",
    ),
    userTurn: (matched, settings) =>
        verifyEach(
            matched,
            (el) =>
                getComputedStyle(el)
                    .getPropertyValue("--user-chat-width")
                    .trim() === `${settings.messageMaxWidthStyle}%`,
            `carry --user-chat-width ${settings.messageMaxWidthStyle}%`,
        ),
    composerForm: (matched, settings) =>
        verifyEach(
            matched,
            (el) =>
                getComputedStyle(el).maxWidth ===
                    `${settings.inputBoxMaxWidthStyle}%` &&
                rendersAtWidthPercent(el, settings.inputBoxMaxWidthStyle),
            `render at ${settings.inputBoxMaxWidthStyle}% width`,
        ),
    turnContentWidthCap: widthCapRemoved,
    composerWidthCap: widthCapRemoved,
    sidebarSurface: (matched, settings) =>
        settings.customBackgroundsEnabled
            ? colorVerifier(
                  (value) =>
                      value.syncBackgroundColors
                          ? value.syncedBackgroundStyle
                          : value.sidebarBackgroundStyle,
                  "show the sidebar color",
              )(matched, settings)
            : {
                  status: "skipped",
                  detail: "Turn on custom backgrounds to verify",
              },
    scrollRoot: (matched) =>
        verifyEach(
            matched,
            (el) =>
                /auto|scroll/.test(getComputedStyle(el).overflowY) &&
                el.scrollHeight > el.clientHeight,
            "are scrollable",
        ),
    scrollControlHost: (matched) =>
        verifyEach(
            matched,
            (el) => Boolean(el.querySelector(`#${SCROLL_TO_TOP_MOUNT_ID}`)),
            "host the scroll-to-top button",
        ),
};

export const hasEffectCheck = (key: SelectorKey): boolean =>
    Boolean(VERIFIERS[key]);

/**
 * Score `selector` against a target: validity, match count versus what the
 * target expects, coverage of the heuristically found elements, and (when the
 * selector is the one the extension is actively using) whether its effect landed.
 */
export const testSelector = ({
    definition,
    selector,
    found,
    settings,
    active,
    doc = document,
}: {
    definition: SelectorDefinition;
    selector: string;
    found: Element[];
    settings: Settings | null;
    active: boolean;
    doc?: Document;
}): SelectorTestResult => {
    const trimmed = selector.trim();
    let matched: Element[];
    try {
        if (!trimmed) throw new Error("empty");
        matched = Array.from(doc.querySelectorAll(trimmed));
    } catch {
        return {
            selector: trimmed,
            valid: false,
            count: 0,
            coverage: 0,
            foundElements: found.length,
            status: "fail",
            messages: [
                trimmed ? "Not a valid CSS selector." : "Selector is empty.",
            ],
            effect: null,
        };
    }

    const count = matched.length;
    const coverage = found.filter((el) => matched.indexOf(el) !== -1).length;
    const messages: string[] = [];
    let status: SelectorTestStatus = "pass";
    const raise = (next: SelectorTestStatus, message: string): void => {
        if (SEVERITY[next] > SEVERITY[status]) status = next;
        messages.push(message);
    };

    if (count < definition.expectAtLeast) {
        raise(
            "fail",
            `Matches ${count}; needs at least ${definition.expectAtLeast}.`,
        );
    } else if (count === 0) {
        raise(
            "warn",
            "No matches. Optional target: open the related UI and retest.",
        );
    }

    if (count && hasLayout(doc) && !matched.some(isVisuallyPresent)) {
        raise(
            "fail",
            "Every match is visually hidden (e.g. a screen-reader-only label).",
        );
    }

    const expectMax = definition.expectMax ?? 1;
    if (definition.expect === "one" && count > expectMax) {
        raise(
            "warn",
            `Matches ${count} elements; expected ${
                expectMax === 1 ? "one" : `at most ${expectMax}`
            }.`,
        );
    }

    if (found.length && count) {
        if (coverage === 0) {
            raise(
                "warn",
                `Matches none of the ${found.length} elements the heuristics found.`,
            );
        } else if (definition.expect === "many") {
            // Heuristics over-collect on unfamiliar markup, so only a minority is suspicious.
            if (coverage < Math.ceil(found.length / 2)) {
                raise(
                    "warn",
                    `Covers only ${coverage}/${found.length} heuristic matches.`,
                );
            } else if (coverage < found.length) {
                messages.push(
                    `Covers ${coverage}/${found.length} heuristic matches.`,
                );
            }
            if (isImprecise(count, found.length)) {
                raise(
                    "warn",
                    `Broader than the target: ${count} matches for ${found.length} found elements. It may include other elements (e.g. the other role's turns).`,
                );
            }
        }
    }

    let effect: EffectCheck | null = null;
    const verifier = VERIFIERS[definition.key];
    if (verifier && settings && active && count) {
        effect = verifier(
            matched.filter(
                (el): el is HTMLElement => el instanceof HTMLElement,
            ),
            settings,
        );
        if (effect.status === "fail") {
            raise("fail", `Live effect failed: ${effect.detail}.`);
        } else if (effect.status === "warn") {
            raise("warn", `Live effect partial: ${effect.detail}.`);
        }
    }

    return {
        selector: trimmed,
        valid: true,
        count,
        coverage,
        foundElements: found.length,
        status,
        messages,
        effect,
    };
};
