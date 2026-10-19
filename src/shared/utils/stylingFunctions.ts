import { Settings } from "@src/shared/settings";
import {
    UpdateStylesMessage,
    UpdateBackgroundImageMessage,
} from "@src/shared/messaging";
import {
    BACKGROUND_LAYER_ID,
    BACKGROUND_LAYER_IMAGE_CLASS,
} from "@src/shared/backgroundImage";
import {
    asCompound,
    DEFAULT_SELECTORS,
    SelectorMap,
} from "@src/shared/selectors";

// Pre-app-shell turns held one message each. On the app-shell layout the same
// child path lands on an exchange's content blocks, so keep this rule scoped.
const LEGACY_MESSAGE_TURN = '[data-testid^="conversation-turn-"]';

const buildFixedStyles = (selectors: SelectorMap): string => {
    return `
    /* Remove ChatGPT's shared 40/48rem cap while preserving responsive gutters. */
    ${selectors.turnContentWidthCap},
    ${selectors.composerWidthCap} {
        width: 100% !important;
        max-width: none !important;
    }
    ${LEGACY_MESSAGE_TURN} > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
    html.light ${asCompound(selectors.composerSubmit)} { color:white }
`;
};

const clampOpacityFraction = (raw: string): number => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
        return 0.25;
    }
    return Math.min(100, Math.max(0, parsed)) / 100;
};

const buildBackgroundStyles = (
    settings: Settings,
    selectors: SelectorMap,
): string => {
    const conversationBackground = settings.syncBackgroundColors
        ? settings.syncedBackgroundStyle
        : settings.conversationBackgroundStyle;
    const sidebarBackground = settings.syncBackgroundColors
        ? settings.syncedBackgroundStyle
        : settings.sidebarBackgroundStyle;

    let css = "";

    if (settings.customBackgroundsEnabled) {
        // Older layouts paint the conversation from --main-surface-primary; the
        // app-shell layout paints <main> and its overlays from --color-surface.
        css += `
          html.light, html.dark,
          html.light :not(:where(.dark,.dark *)),
          html.dark :not(:where(.light,.light *)) {
            --main-surface-primary: ${conversationBackground} !important;
          }
          ${selectors.conversationMain} {
            --color-surface: ${conversationBackground} !important;
            --app-color-background-surface: ${conversationBackground} !important;
            background-color: ${conversationBackground} !important;
          }
          ${selectors.sidebarSurface} {
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
          ${selectors.conversationMain} {
            --color-surface: transparent !important;
            --app-color-background-surface: transparent !important;
            background-color: transparent !important;
          }
          /* The layer is absolutely positioned; lift the thread above it. */
          ${selectors.scrollRoot} {
            position: relative;
            z-index: 1;
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

const buildDynamicStyles = (
    settings: Settings,
    selectors: SelectorMap,
): string => {
    const messageBubbles = asCompound(selectors.messageTurn);
    const userTurns = selectors.userTurn;
    const assistantTurns = selectors.assistantTurn;
    const userBubble = selectors.userBubble;
    const assistantMessage = selectors.assistantMessage;
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
          /* Width is required: in a flex column, auto margins shrink the form to its content. */
          ${selectors.composerForm} {
            width: 100% !important;
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
          ${buildBackgroundStyles(settings, selectors)}
          ${scrollToTopStyles}
        `;
};

/** Pure settings + selectors → CSS. Output depends only on its arguments. */
export const buildCss = (
    settings: Settings,
    selectors: SelectorMap = DEFAULT_SELECTORS,
): string => {
    return (
        buildDynamicStyles(settings, selectors) + buildFixedStyles(selectors)
    );
};

/** @deprecated Prefer buildCss. Kept as an alias for existing call sites. */
export const updateStyles = (
    settings: Settings,
    selectors: SelectorMap = DEFAULT_SELECTORS,
): string => {
    return buildCss(settings, selectors);
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

/** Live preview: the content script builds CSS so it can use its active selectors. */
export const sendMessageToTab = (settings: Settings): void => {
    sendToActiveTab({
        action: "updateStyles",
        settings,
    });
};

/** Live-preview the injected background image (or its removal via null). */
export const sendBackgroundImageToTab = (dataUrl: string | null): void => {
    sendToActiveTab({
        action: "updateBackgroundImage",
        dataUrl,
    });
};
