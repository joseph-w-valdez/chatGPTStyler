import {
    buildCss,
    updateStyles,
    sendMessageToTab,
    sendBackgroundImageToTab,
} from "../stylingFunctions";
import { defaultSettings, Settings } from "@src/shared/settings";
import { BACKGROUND_LAYER_ID } from "@src/shared/backgroundImage";

describe("buildCss", () => {
    it("includes default width, padding, and color values", () => {
        const css = buildCss(defaultSettings);

        expect(css).toContain(
            `max-width: ${defaultSettings.messageMaxWidthStyle}% !important`,
        );
        expect(css).toContain(
            `--user-chat-width: ${defaultSettings.messageMaxWidthStyle}% !important`,
        );
        expect(css).toContain("width: var(--user-chat-width) !important");
        expect(css).toContain(
            `padding: ${defaultSettings.messagePaddingStyle}px !important`,
        );
        expect(css).toContain(
            `border-radius: ${defaultSettings.messageBorderRadiusStyle}px !important`,
        );
        expect(css).toContain(
            `background-color: ${defaultSettings.messageColorUserStyle} !important`,
        );
        expect(css).toContain(
            `background-color: ${defaultSettings.messageColorNonUserStyle} !important`,
        );
        expect(css).toContain('[data-turn="user"] .user-message-bubble-color');
        expect(css).toContain(
            '[data-turn="assistant"] [data-message-author-role="assistant"]',
        );
        expect(css).not.toContain(":nth-child(odd) > * > *");
        expect(css).not.toContain("visibility:");
    });

    it("is deterministic for the same settings object", () => {
        const settings: Settings = {
            ...defaultSettings,
            messageMaxWidthStyle: "80",
            messagePaddingStyle: "12",
        };

        expect(buildCss(settings)).toBe(buildCss(settings));
    });

    it("does not depend on previous calls", () => {
        const wide: Settings = {
            ...defaultSettings,
            messageMaxWidthStyle: "99",
        };
        const narrow: Settings = {
            ...defaultSettings,
            messageMaxWidthStyle: "40",
        };

        buildCss(wide);
        const css = buildCss(narrow);

        expect(css).toContain("max-width: 40%");
        expect(css).not.toContain("max-width: 99%");
    });

    it("includes fixed helper styles", () => {
        const css = buildCss(defaultSettings);

        expect(css).toContain(
            '[data-testid^="conversation-turn-"] [data-conversation-screenshot-content]',
        );
        expect(css).toContain("#thread-bottom > div > div > div > div");
        expect(css).toContain("max-width: none !important");
        expect(css).toContain("html.light #composer-submit-button");
        expect(css).not.toContain(".bg-token-message-surface");
        expect(css).not.toContain(".bg-token-main-surface-tertiary");
        expect(css).not.toContain('main > [role="presentation"]');
    });

    it("keeps updateStyles as a buildCss alias", () => {
        expect(updateStyles(defaultSettings)).toBe(buildCss(defaultSettings));
    });

    it("omits background surface overrides while customization is disabled", () => {
        const css = buildCss(defaultSettings);

        expect(css).not.toContain("--main-surface-primary");
        expect(css).not.toContain(".bg-token-sidebar-surface-primary");
    });

    it("applies separate conversation and sidebar colors when enabled", () => {
        const settings: Settings = {
            ...defaultSettings,
            customBackgroundsEnabled: true,
            syncBackgroundColors: false,
            conversationBackgroundStyle: "#111111",
            sidebarBackgroundStyle: "#222222",
            syncedBackgroundStyle: "#333333",
        };
        const css = buildCss(settings);

        expect(css).toContain("--main-surface-primary: #111111 !important");
        expect(css).toContain("background-color: #222222 !important");
        expect(css).toContain(".bg-token-sidebar-surface-primary");
        expect(css).toContain(".bg-\\(--sidebar-surface-primary\\)");
        expect(css).not.toContain("--main-surface-primary: #333333");
    });

    it("applies the synced color to both surfaces when sync is enabled", () => {
        const settings: Settings = {
            ...defaultSettings,
            customBackgroundsEnabled: true,
            syncBackgroundColors: true,
            conversationBackgroundStyle: "#111111",
            sidebarBackgroundStyle: "#222222",
            syncedBackgroundStyle: "#abcdef",
        };
        const css = buildCss(settings);

        expect(css).toContain("--main-surface-primary: #abcdef !important");
        expect(css).toContain("background-color: #abcdef !important");
    });

    it("omits the background image layer while disabled", () => {
        const css = buildCss(defaultSettings);

        expect(css).not.toContain(`#${BACKGROUND_LAYER_ID}`);
        expect(css).not.toContain("--main-surface-primary: transparent");
    });

    it("makes the conversation surface transparent and sets image opacity when enabled", () => {
        const css = buildCss({
            ...defaultSettings,
            backgroundImageEnabled: true,
            backgroundImageOpacity: "40",
        });

        expect(css).toContain("--main-surface-primary: transparent !important");
        expect(css).toContain(`#${BACKGROUND_LAYER_ID}`);
        expect(css).toContain("display: block !important");
        expect(css).toContain("opacity: 0.4 !important");
    });

    it("paints the conversation color under the image so it shows through", () => {
        const css = buildCss({
            ...defaultSettings,
            customBackgroundsEnabled: true,
            backgroundImageEnabled: true,
            conversationBackgroundStyle: "#123456",
            sidebarBackgroundStyle: "#654321",
        });

        expect(css).toContain("--main-surface-primary: transparent !important");
        expect(css).toContain(
            `#${BACKGROUND_LAYER_ID} {\n            display: block !important;\n            background-color: #123456 !important;`,
        );
        expect(css).toContain("background-color: #654321 !important");
    });

    it("keeps the image layer transparent when no custom color is enabled", () => {
        const css = buildCss({
            ...defaultSettings,
            backgroundImageEnabled: true,
            conversationBackgroundStyle: "#123456",
        });

        expect(css).toContain(
            `#${BACKGROUND_LAYER_ID} {\n            display: block !important;\n            background-color: transparent !important;`,
        );
        expect(css).not.toContain(
            `#${BACKGROUND_LAYER_ID} {\n            display: block !important;\n            background-color: #123456 !important;`,
        );
    });

    it("shows scroll to top by default and hides it when disabled", () => {
        expect(buildCss(defaultSettings)).not.toContain(
            "#scroll-to-top-btn { display: none !important; }",
        );

        const css = buildCss({
            ...defaultSettings,
            scrollToTopEnabled: false,
        });

        expect(css).toContain(
            "#scroll-to-top-btn { display: none !important; }",
        );
    });
});

describe("sendMessageToTab", () => {
    beforeEach(() => {
        (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError =
            undefined;
        (chrome.tabs.query as jest.Mock).mockImplementation(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id: number; url: string }>) => void,
            ) => {
                callback([{ id: 7, url: "https://chatgpt.com/" }]);
            },
        );
        (chrome.tabs.sendMessage as jest.Mock).mockImplementation(
            (_tabId: number, _message: unknown, callback?: () => void) => {
                if (callback) callback();
            },
        );
    });

    it("sends updateStyles to the active tab", () => {
        sendMessageToTab(defaultSettings);

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            7,
            {
                action: "updateStyles",
                arg: expect.stringContaining(
                    `max-width: ${defaultSettings.messageMaxWidthStyle}%`,
                ),
            },
            expect.any(Function),
        );
    });

    it("skips sendMessage when there is no active tab id", () => {
        (chrome.tabs.query as jest.Mock).mockImplementation(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id?: number }>) => void,
            ) => {
                callback([{}]);
            },
        );

        sendMessageToTab(defaultSettings);

        expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
    });

    it("sends the background image (and its removal) to the active tab", () => {
        sendBackgroundImageToTab("data:image/png;base64,AAAA");
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            7,
            {
                action: "updateBackgroundImage",
                dataUrl: "data:image/png;base64,AAAA",
            },
            expect.any(Function),
        );

        sendBackgroundImageToTab(null);
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            7,
            { action: "updateBackgroundImage", dataUrl: null },
            expect.any(Function),
        );
    });
});
