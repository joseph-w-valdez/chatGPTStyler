import { SettingsType } from "@src/lib/utilities/googleStorage";
import { UpdateStylesMessage } from "@src/shared/messaging";

const messageBubbles = '[data-testid^="conversation-turn-"]';

const fixedStyles = `
    ${messageBubbles} > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
    html.light #composer-submit-button { color:white }
    ${messageBubbles} .bg-token-message-surface {
        background-color: unset;
    }
    ${messageBubbles} .hidden {
        display: block !important;
    }
    ${messageBubbles} .bg-token-message-surface {
        max-width: calc(100% - 40px);
        width: calc(100% - 40px);
    }
    ${messageBubbles} .bg-token-main-surface-tertiary {
        background: transparent;
    }
    main > [role="presentation"] > div:nth-child(2) > div > div {
        padding-left: 0;
    }
    main > [role="presentation"] > div:nth-child(2) > div > div > div {
        max-width: unset;
    }
`;

const buildDynamicStyles = (settings: SettingsType): string => {
    const buttonVisibility = settings.messageButtonsVisibilityStyle
        ? "unset"
        : "invisible";

    return `
            ${messageBubbles} > * > div { max-width: ${settings.messageMaxWidthStyle}% }
          ${messageBubbles} > * > div { padding: ${settings.messagePaddingStyle}px; }
          ${messageBubbles} > * > div { border-radius: ${settings.messageBorderRadiusStyle}px; }
          form {
            max-width: ${settings.inputBoxMaxWidthStyle}% !important;
            margin: auto !important;
            min-width: 300px
        }
          :nth-child(odd) .bg-token-message-surface { color: ${settings.textColorUserStyle}}
            ${messageBubbles}:nth-child(even) {
                div > div > div:nth-child(2) > div, p, ul, li, strong, p > code, ul code, li::before, h1, h2, h3, h4 {
                    color: ${settings.textColorNonUserStyle};}}
          ${messageBubbles} button { visibility: ${buttonVisibility} }
          ${messageBubbles}:nth-child(odd) > * > * { background-color: ${settings.messageColorUserStyle} !important }
          ${messageBubbles} textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);;
            border-radius: 5px
        }
          ${messageBubbles}:nth-child(even) > * > * { background-color: ${settings.messageColorNonUserStyle} !important }
        `;
};

/** Pure settings → CSS. Output depends only on the provided settings object. */
export const buildCss = (settings: SettingsType): string => {
    return buildDynamicStyles(settings) + fixedStyles;
};

/** @deprecated Prefer buildCss. Kept as an alias for existing call sites. */
export const updateStyles = (settings: SettingsType): string => {
    return buildCss(settings);
};

export const sendMessageToTab = (settings: SettingsType): void => {
    const message: UpdateStylesMessage = {
        action: "updateStyles",
        arg: buildCss(settings),
    };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
            return;
        }

        const tabId = tabs[0]?.id;
        if (tabId === undefined) {
            return;
        }

        chrome.tabs.sendMessage(tabId, message, () => {
            // Active tab may not be chatgpt.com / have no content script.
            void chrome.runtime.lastError;
        });
    });
};
