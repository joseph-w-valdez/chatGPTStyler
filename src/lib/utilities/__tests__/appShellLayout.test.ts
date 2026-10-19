import { APP_SHELL_CONVERSATION } from "../__fixtures__/appShellConversation";
import {
    getHealedSelectors,
    HEALED_SELECTORS_STORAGE_KEY,
    queryActive,
    queryAllActive,
    setHealedSelectors,
    setSimulatedBreaks,
} from "../activeSelectors";
import { repairSelectors } from "../selectorRepair";
import { exportWorkingSelectors } from "../selectorExport";
import { testSelector } from "../selectorTesting";
import {
    DEFAULT_SELECTORS,
    getSelectorDefinition,
    SELECTOR_DEFINITIONS,
    SelectorKey,
} from "@src/shared/selectors";

describe("built-in selectors on the app-shell layout", () => {
    beforeEach(() => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;
    });

    it.each<[SelectorKey, number]>([
        ["messageTurn", 3],
        ["userTurn", 3],
        ["assistantTurn", 3],
        ["userBubble", 2],
        ["assistantMessage", 3],
        ["turnContentWidthCap", 1],
        ["composerWidthCap", 1],
        ["composerForm", 1],
        ["conversationMain", 1],
        ["scrollRoot", 1],
        ["scrollControlHost", 1],
        ["chatHistory", 2],
        ["profileButton", 2],
    ])("%s matches %i element(s)", (key, expected) => {
        expect(queryAllActive(key)).toHaveLength(expected);
    });

    it("targets the visible reply body, not the hidden role heading", () => {
        const reply = queryActive("assistantMessage");
        expect(reply?.getAttribute("data-markdown-text-style")).toBe(
            "assistant-message",
        );
    });

    it("passes every required selector's live check", () => {
        const failing = SELECTOR_DEFINITIONS.filter(
            (definition) => !definition.optional,
        )
            .filter(
                (definition) =>
                    testSelector({
                        definition,
                        selector: DEFAULT_SELECTORS[definition.key],
                        found: [],
                        settings: null,
                        active: true,
                        doc: document,
                    }).status === "fail",
            )
            .map((definition) => definition.key);
        expect(failing).toEqual([]);
    });
});

describe("repairSelectors", () => {
    afterEach(() => {
        setHealedSelectors({});
        jest.clearAllMocks();
    });

    it("recovers from a future rename and persists only verified repairs", () => {
        // Simulate ChatGPT renaming its turn wrapper attribute again.
        document.body.innerHTML = APP_SHELL_CONVERSATION.replace(
            /data-turn-key=/g,
            "data-thread-turn-id=",
        );
        expect(queryAllActive("messageTurn")).toHaveLength(0);

        const summary = repairSelectors({ settings: null });

        expect(summary.repaired).toEqual([
            { label: "Conversation turns", selector: "[data-thread-turn-id]" },
        ]);
        expect(summary.stillBroken).toEqual([]);
        expect(queryAllActive("messageTurn")).toHaveLength(3);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            [HEALED_SELECTORS_STORAGE_KEY]: {
                messageTurn: expect.objectContaining({
                    selector: "[data-thread-turn-id]",
                }),
            },
        });
    });

    it("drops stale repairs once the built-in selectors work again", () => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;
        setHealedSelectors({
            messageTurn: { selector: ".gone", healedAt: "earlier" },
        });

        const summary = repairSelectors({ settings: null });

        expect(summary.repaired).toEqual([]);
        expect(summary.activeRepairs).toBe(0);
        expect(getHealedSelectors()).toEqual({});
    });
});

describe("exportWorkingSelectors", () => {
    afterEach(() => {
        setHealedSelectors({});
        jest.clearAllMocks();
    });

    it("reports the built-in defaults as working with nothing to promote", () => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;

        const output = exportWorkingSelectors({ settings: null });

        expect(output.summary.broken).toEqual([]);
        expect(output.selectors.userBubble).toMatchObject({
            status: "pass",
            source: "default",
            selector: "[data-user-message-bubble]",
            count: 2,
        });
        expect(output.registryPatch).toEqual({});
    });

    it("produces a registry patch that promotes a repair and keeps the old default", () => {
        document.body.innerHTML = APP_SHELL_CONVERSATION.replace(
            /data-turn-key=/g,
            "data-thread-turn-id=",
        );

        const output = exportWorkingSelectors({ settings: null });

        expect(output.summary.repaired).toEqual(["Conversation turns"]);
        expect(output.selectors.messageTurn).toMatchObject({
            source: "repaired",
            selector: "[data-thread-turn-id]",
        });
        expect(output.registryPatch).toEqual({
            messageTurn: {
                defaultSelector: "[data-thread-turn-id]",
                fallbacks: [
                    "[data-turn-key]",
                    '[data-testid^="conversation-turn-"]',
                ],
            },
        });
    });
});

describe("repair drill with simulated breaks", () => {
    afterEach(() => {
        setSimulatedBreaks([]);
        setHealedSelectors({});
        jest.clearAllMocks();
    });

    it("heals selectors whose built-ins match nothing and exports a patch", () => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;
        setSimulatedBreaks([
            "messageTurn",
            "userBubble",
            "assistantMessage",
            "scrollRoot",
        ]);
        expect(queryAllActive("userBubble")).toHaveLength(0);

        const output = exportWorkingSelectors({ settings: null });

        expect(output.summary.broken).toEqual([]);
        expect(output.summary.repaired).toEqual(
            expect.arrayContaining([
                "Conversation turns",
                "User message bubble",
                "Assistant message",
                "Conversation scroll container",
            ]),
        );
        expect(
            queryActive("userBubble")?.hasAttribute("data-user-message-bubble"),
        ).toBe(true);
        expect(output.selectors.assistantMessage.selector).toBe(
            '[data-markdown-text-style="assistant-message"]',
        );
        // Rediscovering the built-in default leaves nothing to promote.
        expect(output.registryPatch.assistantMessage).toBeUndefined();
    });
});

describe("visibility check", () => {
    let rectSpy: jest.SpyInstance;

    beforeEach(() => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;
        // Give the page real layout, with the sr-only heading as a 1×1 box.
        rectSpy = jest
            .spyOn(Element.prototype, "getBoundingClientRect")
            .mockImplementation(function (this: Element) {
                const size = this.classList.contains("sr-only") ? 1 : 400;
                return { width: size, height: size } as DOMRect;
            });
    });

    afterEach(() => rectSpy.mockRestore());

    it("still treats screen-reader labels as hidden after our padding enlarges them", () => {
        rectSpy.mockImplementation(
            () => ({ width: 20, height: 20 } as DOMRect),
        );

        const result = testSelector({
            definition: getSelectorDefinition("assistantMessage"),
            selector: '[data-conversation-role="assistant"]',
            found: [],
            settings: null,
            active: false,
        });

        expect(result.status).toBe("fail");
    });

    it("fails a selector whose only matches are screen-reader-only labels", () => {
        const result = testSelector({
            definition: getSelectorDefinition("assistantMessage"),
            selector: '[data-conversation-role="assistant"]',
            found: [],
            settings: null,
            active: false,
        });

        expect(result.status).toBe("fail");
        expect(result.messages.join(" ")).toContain("visually hidden");
    });
});
