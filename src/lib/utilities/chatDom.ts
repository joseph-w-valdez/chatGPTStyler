// Stable attribute on ChatGPT's conversation scrollport (overflow-y: auto).
export const CHAT_SCROLL_PARENT_SELECTOR = "[data-scroll-root]";

// Parent of ChatGPT's scroll-to-bottom control (`relative mx-auto h-0`).
export const SCROLL_CONTROL_HOST_SELECTOR =
    '#thread-bottom-container [style*="--thread-scroll-to-bottom-banner-offset"]';

export const USER_TEXT_CONTAINER_SELECTOR = '[data-message-author-role="user"]';

export const INPUT_BOX_CONTAINER_SELECTOR = "#thread-bottom > * > div";

export const SCROLL_TO_TOP_MOUNT_ID = "scroll-to-top-mount";

/**
 * Known CSS from ChatGPT's native scroll-to-bottom control.
 * Native applies the same bottom calc on BOTH the absolute wrapper and the
 * absolute button inside it, so the effective lift is 2× that value.
 * left is shifted +2.5rem so we sit beside the centered native button
 * (32px button + 8px gap = 40px = 2.5rem between centers).
 */
export const SCROLL_TO_TOP_BUTTON_STYLE: Readonly<Record<string, string>> = {
    position: "absolute",
    left: "calc(50% + 2.5rem)",
    bottom: "calc(100% + 6 * var(--spacing) + 2 * var(--thread-scroll-to-bottom-banner-offset, 0px))",
    transform: "translateX(-50%)",
    zIndex: "10",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    pointerEvents: "auto",
    borderRadius: "9999px",
    overflow: "hidden",
};

// Visual utilities that already exist on chatgpt.com (no absolute placement).
export const SCROLL_TO_TOP_BUTTON_CLASS_NAME =
    "btn-secondary bg-token-bg-primary/65! hover:bg-token-main-surface-secondary/75! shadow-short box-content backdrop-blur-[2px] backdrop-filter sm:shadow-md dark:shadow-none! outline-hidden select-none";
