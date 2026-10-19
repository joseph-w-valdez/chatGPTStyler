import { act } from "react";
import {
    closeSelectorInspector,
    openSelectorInspector,
    SELECTOR_INSPECTOR_HOST_ID,
} from "..";
import {
    getActiveSelector,
    getSelectorAlternatives,
    setHealedSelectors,
    setSelectorOverrides,
} from "@src/lib/utilities/activeSelectors";
import { defaultSettings } from "@src/shared/settings";
import { DEFAULT_SELECTORS } from "@src/shared/selectors";
import { APP_SHELL_CONVERSATION } from "@src/lib/utilities/__fixtures__/appShellConversation";

(
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const shadow = (): ShadowRoot =>
    document.getElementById(SELECTOR_INSPECTOR_HOST_ID)
        ?.shadowRoot as ShadowRoot;

const inspectorText = (): string => shadow()?.textContent || "";

const buttonWithText = (root: ParentNode, text: string): HTMLButtonElement => {
    const button = Array.from(root.querySelectorAll("button")).find(
        (candidate) => candidate.textContent?.trim() === text,
    );
    if (!button) throw new Error(`No "${text}" button`);
    return button;
};

const typeInto = (input: HTMLInputElement, value: string): void => {
    const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
    )?.set;
    setValue?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
};

// Simulates ChatGPT renaming its turn markup so every turn selector breaks.
const RENAMED_TURNS = `
    <main>
        <article data-testid="chat-turn-1" data-message-turn="user">
            <div data-message-author-role="user"><div class="user-message-bubble-color">a</div></div>
        </article>
        <article data-testid="chat-turn-2" data-message-turn="assistant">
            <div data-message-author-role="assistant">b</div>
        </article>
    </main>
`;

describe("SelectorInspector", () => {
    const getSettings = () => defaultSettings;

    afterEach(() => {
        act(() => closeSelectorInspector());
        setSelectorOverrides({});
        setHealedSelectors({});
    });

    it("intercepts the picked click and lists selectors for that element", () => {
        document.body.innerHTML = `
            <form><button id="composer-submit-button" data-testid="send-button">Send</button></form>
        `;
        const button = document.getElementById(
            "composer-submit-button",
        ) as HTMLElement;
        const pageClick = jest.fn();
        button.addEventListener("click", pageClick);

        act(() => openSelectorInspector("pick", getSettings));
        expect(inspectorText()).toContain("Click an element to inspect");

        act(() => {
            button.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true }),
            );
        });

        expect(pageClick).not.toHaveBeenCalled();
        expect(inspectorText()).toContain("#composer-submit-button");
        expect(inspectorText()).toContain('[data-testid="send-button"]');
        expect(inspectorText()).toContain("Composer submit button");
    });

    it("repairs a renamed selector from the workbench", () => {
        document.body.innerHTML = RENAMED_TURNS;

        act(() => openSelectorInspector("audit", getSettings));
        expect(inspectorText()).toContain("selectors failing");

        act(() => buttonWithText(shadow(), "Run Repair").click());

        expect(getSelectorAlternatives("messageTurn")[0]).toBe(
            '[data-testid^="chat-turn-"]',
        );
        expect(inspectorText()).toContain("Conversation turns");
        expect(inspectorText()).toMatch(/Repair: [1-9]\d* repaired/);
    });

    it("flags saved overrides that are worse than the built-ins and resets them", () => {
        document.body.innerHTML = APP_SHELL_CONVERSATION;
        setSelectorOverrides({ messageTurn: ".turn-action-controls" });

        act(() => openSelectorInspector("audit", getSettings));
        expect(inspectorText()).toContain("worse than the built-in selector");

        act(() => buttonWithText(shadow(), "Use built-ins").click());

        expect(getActiveSelector("messageTurn")).toBe(
            DEFAULT_SELECTORS.messageTurn,
        );
        expect(inspectorText()).not.toContain(
            "worse than the built-in selector",
        );
    });

    it("applies a hand-edited selector and retests it", () => {
        document.body.innerHTML = RENAMED_TURNS;
        act(() => openSelectorInspector("audit", getSettings));

        const input = shadow().querySelector(
            'input[aria-label="Selector for Conversation turns"]',
        ) as HTMLInputElement;
        act(() => typeInto(input, "article"));
        act(() =>
            buttonWithText(input.form as HTMLFormElement, "Apply").click(),
        );

        expect(getActiveSelector("messageTurn")).toBe("article");
        expect(input.form?.textContent).toContain("2 matches");
        expect(input.closest("details")?.textContent).toContain("override");
    });
});
