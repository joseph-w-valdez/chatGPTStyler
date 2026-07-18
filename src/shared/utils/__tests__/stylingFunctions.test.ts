import { buildCss, updateStyles, sendMessageToTab } from "../stylingFunctions";
import { defaultSettings } from "../data";
import { SettingsType } from "@src/lib/utilities/googleStorage";

describe("buildCss", () => {
    it("includes default width, padding, and color values", () => {
        const css = buildCss(defaultSettings);

        expect(css).toContain(
            `max-width: ${defaultSettings.messageMaxWidthStyle}%`,
        );
        expect(css).toContain(
            `padding: ${defaultSettings.messagePaddingStyle}px`,
        );
        expect(css).toContain(
            `border-radius: ${defaultSettings.messageBorderRadiusStyle}px`,
        );
        expect(css).toContain(
            `background-color: ${defaultSettings.messageColorUserStyle} !important`,
        );
        expect(css).toContain(
            `background-color: ${defaultSettings.messageColorNonUserStyle} !important`,
        );
        expect(css).toContain(`visibility: unset`);
    });

    it("applies messageButtonsVisibilityStyle false", () => {
        const settings: SettingsType = {
            ...defaultSettings,
            messageButtonsVisibilityStyle: false,
        };

        expect(buildCss(settings)).toContain("visibility: invisible");
        expect(buildCss(settings)).not.toContain("visibility: unset");
    });

    it("is deterministic for the same settings object", () => {
        const settings: SettingsType = {
            ...defaultSettings,
            messageMaxWidthStyle: "80",
            messagePaddingStyle: "12",
        };

        expect(buildCss(settings)).toBe(buildCss(settings));
    });

    it("does not depend on previous calls", () => {
        const wide: SettingsType = {
            ...defaultSettings,
            messageMaxWidthStyle: "99",
        };
        const narrow: SettingsType = {
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

        expect(css).toContain("html.light #composer-submit-button");
        expect(css).toContain("background-color: unset");
        expect(css).toContain("display: block !important");
    });

    it("keeps updateStyles as a buildCss alias", () => {
        expect(updateStyles(defaultSettings)).toBe(buildCss(defaultSettings));
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
});
