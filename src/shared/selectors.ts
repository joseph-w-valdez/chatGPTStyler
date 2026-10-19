// Every ChatGPT DOM selector the extension depends on. Generated CSS, content
// script integrations, delete-all, and the dev selector tools all read from
// here, so a fix only needs to change one default.
//
// Each entry keeps every known-good variant: `defaultSelector` for the current
// ChatGPT layout plus `fallbacks` for previous layouts. They are applied as a
// union, so the extension keeps working while ChatGPT rolls a redesign out
// gradually (or rolls it back).

export type SelectorKey =
    | "messageTurn"
    | "userTurn"
    | "assistantTurn"
    | "userBubble"
    | "assistantMessage"
    | "turnContentWidthCap"
    | "composerWidthCap"
    | "composerForm"
    | "composerSubmit"
    | "conversationMain"
    | "sidebarSurface"
    | "scrollRoot"
    | "scrollControlHost"
    | "chatHistory"
    | "profileButton"
    | "settingsMenuItem"
    | "dataControlsTab"
    | "deleteAllButton"
    | "confirmDeleteButton";

export type SelectorMap = Record<SelectorKey, string>;

export type SelectorDefinition = {
    key: SelectorKey;
    label: string;
    /** What the extension does with the matched element. */
    description: string;
    /** What the correct element looks like on the page, to guide picking. */
    lookFor: string;
    /** Selector for the current ChatGPT layout. */
    defaultSelector: string;
    /** Selectors from earlier layouts, still applied in case they return. */
    fallbacks?: string[];
    /** Whether a healthy page has a single match or a repeated set. */
    expect: "one" | "many";
    /** Minimum matches on an open conversation. */
    expectAtLeast: number;
    /** For `expect: "one"`, how many copies ChatGPT legitimately renders. Defaults to 1. */
    expectMax?: number;
    /** Only present while related UI (menus, dialogs, sidebar) is open. */
    optional?: boolean;
};

export const SELECTOR_DEFINITIONS: SelectorDefinition[] = [
    {
        key: "messageTurn",
        label: "Conversation turns",
        description: "Wraps each exchange. Used to style the message edit box.",
        lookFor:
            "One element per exchange (your message plus ChatGPT's reply), repeated down the thread.",
        defaultSelector: "[data-turn-key]",
        fallbacks: ['[data-testid^="conversation-turn-"]'],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "userTurn",
        label: "User turns",
        description:
            "Wraps your side of each exchange. Gets --user-chat-width so the Message Width slider widens your bubbles and attachments.",
        lookFor:
            "The container holding one of your messages (bubble plus attachments), not the whole exchange. One per user message.",
        defaultSelector: '[data-chatgpt-search-unit-key$=":user"]',
        fallbacks: ['[data-turn="user"]'],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "assistantTurn",
        label: "Assistant turns",
        description:
            "Wraps ChatGPT's side of each exchange. Used to recolor reply text (paragraphs, lists, headings, inline code).",
        lookFor:
            "The container holding one ChatGPT reply, not the whole exchange. One per reply; must not depend on streaming state.",
        defaultSelector: '[data-chatgpt-search-unit-key$=":assistant"]',
        fallbacks: ['[data-turn="assistant"]'],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "userBubble",
        label: "User message bubble",
        description:
            "The filled bubble behind your text. Gets your bubble color, text color, padding, corner radius, and width.",
        lookFor:
            "The rounded, colored box directly around your message text, not the full-width row. One per user message.",
        defaultSelector: "[data-user-message-bubble]",
        fallbacks: ['[data-turn="user"] .user-message-bubble-color'],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "assistantMessage",
        label: "Assistant message",
        description:
            "ChatGPT's visible reply body. Gets the ChatGPT bubble color, padding, corner radius, and max width.",
        lookFor:
            'The element wrapping one reply\'s rendered markdown. Not the hidden "ChatGPT said:" heading. One per reply.',
        defaultSelector: '[data-markdown-text-style="assistant-message"]',
        fallbacks: [
            '[data-turn="assistant"] [data-message-author-role="assistant"]',
        ],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "turnContentWidthCap",
        label: "Conversation width cap",
        description:
            "Gets max-width: none so the Message Width slider can go past ChatGPT's ~48rem column.",
        lookFor:
            "The centered column that limits message width (uses --thread-body-max-width or --thread-content-max-width). On the current layout, one column holding every turn.",
        defaultSelector: "[data-thread-user-message-navigation-content]",
        fallbacks: [
            '[data-testid^="conversation-turn-"] [data-conversation-screenshot-content]',
        ],
        expect: "many",
        expectAtLeast: 1,
    },
    {
        key: "composerWidthCap",
        label: "Composer width cap",
        description:
            "Gets max-width: none so the Input Box Width slider can exceed ChatGPT's default column.",
        lookFor:
            "The centered column around the bottom input box that limits its width. Exactly one, an ancestor of the composer form.",
        defaultSelector: '[data-pip-obstacle="thread-footer"]',
        fallbacks: ["#thread-bottom > div > div > div > div"],
        expect: "one",
        expectAtLeast: 1,
    },
    {
        key: "composerForm",
        label: "Composer form",
        description: "Gets your Input Box Width as max-width and is centered.",
        lookFor:
            "The form (or equivalent shell) containing the prompt text box and its buttons. Exactly one.",
        defaultSelector: "[data-chatgpt-composer]",
        fallbacks: ["form"],
        expect: "one",
        expectAtLeast: 1,
    },
    {
        key: "composerSubmit",
        label: "Composer submit button (when text entered)",
        description:
            "Its icon is forced white in light mode so the send button stays visible.",
        lookFor:
            "The send / submit arrow button. Type something first so it appears.",
        defaultSelector: "#composer-submit-button",
        expect: "one",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "conversationMain",
        label: "Conversation column",
        description:
            "Gets the Conversation background color, and hosts the background image layer as a fallback.",
        lookFor:
            "The main conversation column, excluding the sidebar. Exactly one.",
        defaultSelector: "main",
        expect: "one",
        expectAtLeast: 1,
    },
    {
        key: "sidebarSurface",
        label: "Sidebar surface (when sidebar open)",
        description:
            "Gets the Sidebar background color when custom backgrounds are on.",
        lookFor:
            "The sidebar panel element(s) that paint the sidebar's background, visible while the sidebar is open.",
        defaultSelector:
            ".app-shell-left-panel, #app-shell-sidebar > .bg-surface",
        fallbacks: [
            ".bg-token-sidebar-surface-primary",
            ".bg-\\(--sidebar-surface-primary\\)",
        ],
        expect: "many",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "scrollRoot",
        label: "Conversation scroll container",
        description:
            "Scroll-to-top watches and scrolls it; its parent also hosts the background image layer.",
        lookFor:
            "The element that actually scrolls the conversation (overflow-y auto, content taller than itself). Exactly one; not the header or title bar.",
        defaultSelector: "[data-app-action-timeline-scroll]",
        fallbacks: ["[data-scroll-root]"],
        expect: "one",
        expectAtLeast: 1,
    },
    {
        key: "scrollControlHost",
        label: "Native scroll-to-bottom control host",
        description:
            "The scroll-to-top button mounts inside it, next to ChatGPT's scroll-to-bottom arrow.",
        lookFor:
            "The small positioned wrapper around ChatGPT's round scroll-to-bottom arrow above the composer. Exactly one.",
        defaultSelector: 'div:has(> button[class~="group/scroll-to-bottom"])',
        fallbacks: [
            '#thread-bottom-container [style*="--thread-scroll-to-bottom-banner-offset"]',
        ],
        expect: "one",
        expectAtLeast: 1,
    },
    {
        key: "chatHistory",
        label: "Sidebar conversation links",
        description:
            "Delete-all checks that at least one exists before running.",
        lookFor:
            "Each conversation link in the sidebar history list. One per conversation.",
        defaultSelector:
            '[data-sidebar-chatgpt-conversation-key] a[href*="/c/"]',
        fallbacks: ['#history a[href^="/c/"]'],
        expect: "many",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "profileButton",
        label: "Profile menu button",
        description: "Delete-all clicks it to open the profile menu.",
        lookFor:
            "Your avatar / profile button at the bottom of the sidebar. ChatGPT may render 2 copies (collapsed rail + sidebar); never dozens.",
        // The app-shell layout has no test id; the label is English-only.
        defaultSelector: 'button[aria-label="Open profile menu"]',
        fallbacks: ['[data-testid="accounts-profile-button"]'],
        expect: "one",
        expectMax: 2,
        expectAtLeast: 1,
    },
    {
        key: "settingsMenuItem",
        label: "Settings menu item (profile menu open)",
        description: "Delete-all clicks it in the profile menu.",
        lookFor:
            "The Settings item in the profile menu. Open the menu, then use Alt+Shift+P.",
        defaultSelector: '[data-testid="settings-menu-item"]',
        expect: "one",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "dataControlsTab",
        label: "Data controls tab (Settings open)",
        description: "Delete-all switches to this Settings tab.",
        lookFor: "The Data controls tab inside the Settings dialog.",
        defaultSelector:
            '[role="dialog"][data-state="open"] [data-testid="data-controls-tab"]',
        expect: "one",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "deleteAllButton",
        label: "Delete-all button (Data controls open)",
        description: "Delete-all clicks it.",
        lookFor: "The Delete all chats button on the Data controls tab.",
        // No data-testid on the current button; match the danger outline label.
        defaultSelector:
            '[role="dialog"][data-state="open"] button.btn-danger-outline[aria-label^="Delete all"]',
        expect: "one",
        expectAtLeast: 0,
        optional: true,
    },
    {
        key: "confirmDeleteButton",
        label: "Confirm delete-all button (dialog)",
        description: "Delete-all confirms the deletion here.",
        lookFor: 'The confirm button in the "Delete all chats?" dialog.',
        defaultSelector:
            '[role="dialog"][data-state="open"] [data-testid="confirm-delete-all-chats-button"]',
        expect: "one",
        expectAtLeast: 0,
        optional: true,
    },
];

/** Deduped, trimmed selector list joined into one selector string. */
export const joinSelectors = (selectors: string[]): string =>
    Array.from(
        new Set(selectors.map((selector) => selector.trim()).filter(Boolean)),
    ).join(", ");

/** Known-good variants for a definition, current layout first. */
export const selectorChain = (definition: SelectorDefinition): string[] => [
    definition.defaultSelector,
    ...(definition.fallbacks || []),
];

/** Union of every known-good variant per key. */
export const DEFAULT_SELECTORS: SelectorMap = SELECTOR_DEFINITIONS.reduce(
    (map, definition) => ({
        ...map,
        [definition.key]: joinSelectors(selectorChain(definition)),
    }),
    {} as SelectorMap,
);

export const isSelectorKey = (value: string): value is SelectorKey =>
    SELECTOR_DEFINITIONS.some((definition) => definition.key === value);

export const getSelectorDefinition = (key: SelectorKey): SelectorDefinition =>
    SELECTOR_DEFINITIONS.find(
        (definition) => definition.key === key,
    ) as SelectorDefinition;

/**
 * Lets a selector list (`a, b`) be composed with descendants or suffixes
 * without changing meaning. Single selectors pass through unchanged.
 */
export const asCompound = (selector: string): string =>
    selector.includes(",") ? `:is(${selector})` : selector;
