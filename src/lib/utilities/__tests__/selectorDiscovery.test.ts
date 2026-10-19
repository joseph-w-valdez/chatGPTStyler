import {
    buildSelectorCandidates,
    describeElement,
    discoverSelectors,
    matchProbes,
} from "../selectorDiscovery";

const selectorsOf = (el: Element): string[] =>
    buildSelectorCandidates(el, document).map(
        (candidate) => candidate.selector,
    );

describe("buildSelectorCandidates", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="thread-bottom">
                <form data-type="unified-composer">
                    <div contenteditable="true" id="prompt-textarea" class="ProseMirror"></div>
                </form>
            </div>
            <section data-testid="conversation-turn-3" data-turn="user"
                class="text-token-text-primary w-full R6Vx5W_threadScrollVars">
                <div id="radix-_r_6g_" class="user-message-bubble-color flex rounded-[22px] px-4">hi</div>
            </section>
        `;
    });

    it("prefers stable ids and keeps semantic classes", () => {
        const input = document.getElementById("prompt-textarea") as Element;
        const candidates = buildSelectorCandidates(input, document);

        expect(candidates[0]).toMatchObject({
            selector: "#prompt-textarea",
            kind: "id",
            count: 1,
        });
        expect(selectorsOf(input)).toEqual(
            expect.arrayContaining([
                'div[contenteditable="true"]',
                ".ProseMirror",
                "#thread-bottom div",
            ]),
        );
    });

    it("suggests testid prefixes, data attributes, tokens, and module classes", () => {
        const section = document.querySelector("section") as Element;

        expect(selectorsOf(section)).toEqual(
            expect.arrayContaining([
                '[data-testid^="conversation-turn-"]',
                '[data-turn="user"]',
                ".text-token-text-primary",
                '[class*="_threadScrollVars"]',
            ]),
        );
        expect(selectorsOf(section)).not.toContain(".w-full");
    });

    it("skips dynamic ids and utility classes", () => {
        const bubble = document.querySelector(
            ".user-message-bubble-color",
        ) as Element;
        const selectors = selectorsOf(bubble);

        expect(selectors).toContain(".user-message-bubble-color");
        expect(selectors.some((selector) => selector.includes("radix"))).toBe(
            false,
        );
        expect(selectors).not.toContain(".flex");
        expect(selectors).not.toContain(".px-4");
    });
});

describe("matchProbes", () => {
    it("reports which extension selectors cover a clicked element", () => {
        document.body.innerHTML = `
            <section data-testid="conversation-turn-1" data-turn="user">
                <div data-message-author-role="user">
                    <div class="user-message-bubble-color"><span id="leaf">x</span></div>
                </div>
            </section>
        `;
        const leaf = document.getElementById("leaf") as Element;
        const ids = matchProbes(leaf).map(
            (match) => `${match.id}:${match.relation}`,
        );

        expect(ids).toEqual(
            expect.arrayContaining([
                "messageTurn:ancestor",
                "userBubble:ancestor",
                "roles:ancestor",
            ]),
        );
    });
});

describe("describeElement", () => {
    it("extracts inline custom properties", () => {
        document.body.innerHTML = `<div id="host" style="--thread-scroll-to-bottom-banner-offset: 0px; color: red"></div>`;
        const summary = describeElement(
            document.getElementById("host") as Element,
        );

        expect(summary.label).toBe("div#host");
        expect(summary.inlineCustomProperties).toEqual([
            { name: "--thread-scroll-to-bottom-banner-offset", value: "0px" },
        ]);
    });
});

// Modeled on a real report from ChatGPT's app-shell redesign (Oct 2026).
const APP_SHELL_DOM = `
    <main data-app-shell-main-surface="browser">
        <div data-content-search-turn-key="fallback-turn-0" data-turn-key="k1a2b3c4d5e6f7a8">
            <div class="row"><div data-user-message-bubble="true" class="rounded-3xl">hi</div></div>
        </div>
        <div data-content-search-turn-key="fallback-turn-1" data-turn-key="k9a8b7c6d5e4f3a2"
            data-chatgpt-agent-turn-start data-talvt-turn-state="complete">
            <div data-conversation-role="assistant">reply</div>
        </div>
        <div data-content-search-turn-key="fallback-turn-2" data-turn-key="kaa11bb22cc33dd4">
            <div class="row"><div data-user-message-bubble="true">again</div></div>
        </div>
        <div data-content-search-turn-key="fallback-turn-3" data-turn-key="kff00ee11dd22cc3"
            data-chatgpt-agent-turn-start data-talvt-turn-state="streaming">
            <div data-conversation-role="assistant">reply 2</div>
        </div>
    </main>
    <nav id="app-shell-sidebar">
        <button type="button" data-state="closed" aria-label="Open profile menu">me</button>
        <button type="button" data-state="closed">a</button>
        <button type="button" data-state="closed">b</button>
        <button type="button" data-state="closed">c</button>
        <button type="button" data-state="closed">d</button>
    </nav>
`;

describe("discoverSelectors on the app-shell redesign", () => {
    const suggestionsFor = (id: string): string[] => {
        document.body.innerHTML = APP_SHELL_DOM;
        const target = discoverSelectors(document).targets.find(
            (item) => item.id === id,
        );
        return (target?.suggestions || []).map((item) => item.selector);
    };

    it("turns indexed values into prefix selectors instead of pinning one turn", () => {
        const selectors = suggestionsFor("messageTurn");

        expect(selectors[0]).toBe(
            '[data-content-search-turn-key^="fallback-turn-"]',
        );
        expect(
            selectors.some((selector) =>
                selector.includes('="fallback-turn-0"'),
            ),
        ).toBe(false);
    });

    it("never suggests streaming-state values or generic UI-state attributes", () => {
        const all = [
            ...suggestionsFor("messageTurn"),
            ...suggestionsFor("assistantTurn"),
            ...suggestionsFor("profileButton"),
        ];

        expect(all.some((selector) => selector.includes('="complete"'))).toBe(
            false,
        );
        expect(all.some((selector) => selector.includes("data-state"))).toBe(
            false,
        );
        expect(all).not.toContain('button[type="button"]');
    });

    it("finds user bubbles marked by attribute name", () => {
        expect(suggestionsFor("userBubble")[0]).toBe(
            "[data-user-message-bubble]",
        );
    });

    it("composes role turns with :has() when no attribute separates them", () => {
        expect(suggestionsFor("userTurn")[0]).toBe(
            '[data-content-search-turn-key^="fallback-turn-"]:has([data-user-message-bubble])',
        );
    });

    it("picks an assistant-turn selector that excludes user turns", () => {
        const top = suggestionsFor("assistantTurn")[0];
        const matched = Array.from(document.querySelectorAll(top));

        expect(matched).toHaveLength(2);
        expect(
            matched.some((turn) =>
                turn.querySelector("[data-user-message-bubble]"),
            ),
        ).toBe(false);
    });

    it("prefers the precise profile button over a selector matching every button", () => {
        expect(suggestionsFor("profileButton")[0]).toBe(
            'button[aria-label="Open profile menu"]',
        );
    });
});

describe("discoverSelectors", () => {
    it("finds replacement selectors after ChatGPT renames turn markup", () => {
        document.body.innerHTML = `
            <main>
                <article data-testid="chat-turn-1" data-message-turn="user">
                    <div data-message-author-role="user">
                        <div class="user-message-bubble-color">a</div>
                    </div>
                </article>
                <article data-testid="chat-turn-2" data-message-turn="assistant">
                    <div data-message-author-role="assistant">b</div>
                </article>
            </main>
        `;
        const report = discoverSelectors(document);
        const target = (id: string) =>
            report.targets.find((item) => item.id === id);

        const turns = target("messageTurn");
        expect(turns).toMatchObject({
            broken: true,
            currentCount: 0,
            foundElements: 2,
        });
        expect(turns?.suggestions[0]).toMatchObject({
            selector: '[data-testid^="chat-turn-"]',
            count: 2,
            coverage: 2,
        });

        const bubble = target("userBubble");
        expect(bubble?.broken).toBe(true);
        expect(bubble?.suggestions.map((item) => item.selector)).toContain(
            ".user-message-bubble-color",
        );

        expect(target("conversationMain")).toMatchObject({
            broken: false,
            currentCount: 1,
        });
        expect(report.inventory.testIds).toContainEqual({
            value: "chat-turn-*",
            count: 2,
        });
    });
});
