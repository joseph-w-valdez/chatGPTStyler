import {
    getActiveSelector,
    getSelectorOverrides,
    onActiveSelectorsChange,
    SELECTOR_OVERRIDES_STORAGE_KEY,
    setSelectorOverrides,
} from "../activeSelectors";
import { DEFAULT_SELECTORS, SelectorMap } from "@src/shared/selectors";

describe("activeSelectors", () => {
    afterEach(() => {
        setSelectorOverrides({});
        jest.clearAllMocks();
    });

    it("falls back to registry defaults", () => {
        expect(getActiveSelector("messageTurn")).toBe(
            DEFAULT_SELECTORS.messageTurn,
        );
    });

    it("applies, persists, and announces overrides", () => {
        const listener = jest.fn();
        const unsubscribe = onActiveSelectorsChange(listener);

        setSelectorOverrides({ messageTurn: '  [data-testid^="chat-turn-"] ' });

        expect(getActiveSelector("messageTurn")).toBe(
            '[data-testid^="chat-turn-"]',
        );
        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            [SELECTOR_OVERRIDES_STORAGE_KEY]: {
                messageTurn: '[data-testid^="chat-turn-"]',
            },
        });
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it("drops unknown keys, blanks, and values equal to the default", () => {
        setSelectorOverrides({
            messageTurn: DEFAULT_SELECTORS.messageTurn,
            userBubble: "   ",
            bogus: ".x",
        } as unknown as Partial<SelectorMap>);

        expect(getSelectorOverrides()).toEqual({});
        expect(chrome.storage.local.remove).toHaveBeenCalledWith(
            SELECTOR_OVERRIDES_STORAGE_KEY,
        );
    });
});
