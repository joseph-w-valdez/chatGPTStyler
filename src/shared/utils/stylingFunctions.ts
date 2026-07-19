import { Settings } from "@src/shared/settings";
import { UpdateStylesMessage } from "@src/shared/messaging";

const messageBubbles = '[data-testid^="conversation-turn-"]';
const userTurns = '[data-turn="user"]';
const assistantTurns = '[data-turn="assistant"]';
const userBubble = `${userTurns} .user-message-bubble-color`;
const assistantMessage = `${assistantTurns} [data-message-author-role="assistant"]`;

const fixedStyles = `
    /* Remove ChatGPT's shared 40/48rem cap while preserving responsive gutters. */
    ${messageBubbles} [data-conversation-screenshot-content],
    #thread-bottom > div > div > div > div {
        width: 100% !important;
        max-width: none !important;
    }
    ${messageBubbles} > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
    html.light #composer-submit-button { color:white }
`;

const buildDynamicStyles = (settings: Settings): string => {
    return `
          /* ChatGPT sizes user bubbles and image wrappers from this inherited variable. */
          ${userTurns} {
            --user-chat-width: ${settings.messageMaxWidthStyle}% !important;
          }
          ${assistantMessage} {
            max-width: ${settings.messageMaxWidthStyle}% !important;
          }
          ${userBubble} {
            width: var(--user-chat-width) !important;
          }
          ${userBubble}, ${assistantMessage} {
            padding: ${settings.messagePaddingStyle}px !important;
            border-radius: ${settings.messageBorderRadiusStyle}px !important;
          }
          form {
            max-width: ${settings.inputBoxMaxWidthStyle}% !important;
            margin: auto !important;
            min-width: 300px
        }
          ${userBubble} {
            color: ${settings.textColorUserStyle};
            background-color: ${settings.messageColorUserStyle} !important;
          }
            ${assistantTurns} {
                div > div > div:nth-child(2) > div, p, ul, li, strong, p > code, ul code, li::before, h1, h2, h3, h4 {
                    color: ${settings.textColorNonUserStyle};}}
          ${messageBubbles} textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);;
            border-radius: 5px
        }
          ${assistantMessage} { background-color: ${settings.messageColorNonUserStyle} !important }
        `;
};

/** Pure settings → CSS. Output depends only on the provided settings object. */
export const buildCss = (settings: Settings): string => {
    return buildDynamicStyles(settings) + fixedStyles;
};

/** @deprecated Prefer buildCss. Kept as an alias for existing call sites. */
export const updateStyles = (settings: Settings): string => {
    return buildCss(settings);
};

export const sendMessageToTab = (settings: Settings): void => {
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
