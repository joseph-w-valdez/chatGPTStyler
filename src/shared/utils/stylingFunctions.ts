import { Settings } from "@src/shared/settings";
import {
    UpdateStylesMessage,
    UpdateBackgroundImageMessage,
} from "@src/shared/messaging";
import {
    BACKGROUND_LAYER_ID,
    BACKGROUND_LAYER_IMAGE_CLASS,
} from "@src/shared/backgroundImage";

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

const clampOpacityFraction = (raw: string): number => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
        return 0.25;
    }
    return Math.min(100, Math.max(0, parsed)) / 100;
};

const buildBackgroundStyles = (settings: Settings): string => {
    const conversationBackground = settings.syncBackgroundColors
        ? settings.syncedBackgroundStyle
        : settings.conversationBackgroundStyle;
    const sidebarBackground = settings.syncBackgroundColors
        ? settings.syncedBackgroundStyle
        : settings.sidebarBackgroundStyle;

    let css = "";

    if (settings.customBackgroundsEnabled) {
        css += `
          html.light, html.dark,
          html.light :not(:where(.dark,.dark *)),
          html.dark :not(:where(.light,.light *)) {
            --main-surface-primary: ${conversationBackground} !important;
          }
          .bg-token-sidebar-surface-primary,
          .bg-\\(--sidebar-surface-primary\\) {
            background-color: ${sidebarBackground} !important;
          }
        `;
    }

    if (settings.backgroundImageEnabled) {
        // Transparent ChatGPT surface so the injected layer is visible. The
        // chosen conversation/app color paints the layer *under* the image so
        // it shows through PNG alpha and the opacity slider.
        const layerBase = settings.customBackgroundsEnabled
            ? conversationBackground
            : "transparent";
        const opacity = clampOpacityFraction(settings.backgroundImageOpacity);

        css += `
          html.light, html.dark,
          html.light :not(:where(.dark,.dark *)),
          html.dark :not(:where(.light,.light *)) {
            --main-surface-primary: transparent !important;
          }
          #${BACKGROUND_LAYER_ID} {
            display: block !important;
            background-color: ${layerBase} !important;
          }
          #${BACKGROUND_LAYER_ID} .${BACKGROUND_LAYER_IMAGE_CLASS} {
            opacity: ${opacity} !important;
          }
        `;
    }

    return css;
};

const buildDynamicStyles = (settings: Settings): string => {
    const scrollToTopStyles = settings.scrollToTopEnabled
        ? ""
        : "#scroll-to-top-btn { display: none !important; }";

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
          ${assistantMessage} {
            background-color: ${settings.messageColorNonUserStyle} !important;
          }
          ${buildBackgroundStyles(settings)}
          ${scrollToTopStyles}
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

const sendToActiveTab = (
    message: UpdateStylesMessage | UpdateBackgroundImageMessage,
): void => {
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

export const sendMessageToTab = (settings: Settings): void => {
    sendToActiveTab({
        action: "updateStyles",
        arg: buildCss(settings),
    });
};

/** Live-preview the injected background image (or its removal via null). */
export const sendBackgroundImageToTab = (dataUrl: string | null): void => {
    sendToActiveTab({
        action: "updateBackgroundImage",
        dataUrl,
    });
};
