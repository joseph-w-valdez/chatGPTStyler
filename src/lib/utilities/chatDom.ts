// ChatGPT DOM selectors live in @src/shared/selectors.

export const SCROLL_TO_TOP_MOUNT_ID = "scroll-to-top-mount";

/**
 * Mirrors the lift of ChatGPT's native scroll-to-bottom control on both layouts:
 * the older layout doubles --thread-scroll-to-bottom-banner-offset (wrapper and
 * button both apply it); the app-shell layout adds the composer overlay height.
 * Each layout leaves the other's variables undefined, so they fall back to 0.
 * left is shifted +2.5rem so we sit beside the centered native button
 * (32px button + 8px gap = 40px = 2.5rem between centers).
 */
export const SCROLL_TO_TOP_BUTTON_STYLE: Readonly<Record<string, string>> = {
    position: "absolute",
    left: "calc(50% + 2.5rem)",
    bottom: "calc(100% + 6 * var(--spacing) + 2 * var(--thread-scroll-to-bottom-banner-offset, 0px) + max(var(--thread-composer-overlay-height, 0px), var(--thread-composer-floating-controls-height, 0px)))",
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

// Visual utilities that already exist on chatgpt.com (no absolute placement):
// the first group styles the older layout, the second matches the app-shell
// layout's native arrow. Classes a layout does not ship simply have no effect.
export const SCROLL_TO_TOP_BUTTON_CLASS_NAME =
    "btn-secondary bg-token-bg-primary/65! hover:bg-token-main-surface-secondary/75! shadow-short box-content backdrop-blur-[2px] backdrop-filter sm:shadow-md dark:shadow-none! outline-hidden select-none " +
    "border border-default bg-surface bg-clip-padding text-secondary";
