export type DeleteAllChatsResult =
    | { status: "SUCCESS" }
    | { status: "FAILURE"; message: string };

const POLL_INTERVAL_MS = 100;
const DEFAULT_TIMEOUT_MS = 10000;

export const CHAT_HISTORY_SELECTOR = '#history a[href^="/c/"]';
export const PROFILE_BUTTON_SELECTOR =
    '[data-testid="accounts-profile-button"]';
export const SETTINGS_MENU_ITEM_SELECTOR = '[data-testid="settings-menu-item"]';
export const DATA_CONTROLS_TAB_SELECTOR =
    '[role="dialog"][data-state="open"] [data-testid="data-controls-tab"]';
/** No data-testid on the current ChatGPT button; match the danger outline label. */
export const DELETE_ALL_BUTTON_SELECTOR =
    '[role="dialog"][data-state="open"] button.btn-danger-outline[aria-label^="Delete all"]';
export const CONFIRM_DELETE_BUTTON_SELECTOR =
    '[role="dialog"][data-state="open"] [data-testid="confirm-delete-all-chats-button"]';

/**
 * ChatGPT renders two profile buttons: one in the collapsed rail
 * (`#stage-sidebar-tiny-bar`, marked `inert`) and the visible one in the
 * expanded sidebar. Pick the interactive (non-inert) button so the menu opens.
 */
const findVisibleProfileButton = (): HTMLElement | null => {
    const buttons = Array.from(
        document.querySelectorAll<HTMLElement>(PROFILE_BUTTON_SELECTOR),
    );
    return buttons.find((el) => !el.closest("[inert]")) ?? buttons[0] ?? null;
};

const waitForElement = <T extends Element>(
    selector: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> => {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(selector);
        if (existing) {
            resolve(existing as T);
            return;
        }

        const maxAttempts = Math.max(
            1,
            Math.ceil(timeoutMs / POLL_INTERVAL_MS),
        );
        let attempts = 0;
        const intervalId = window.setInterval(() => {
            attempts += 1;
            const element = document.querySelector(selector);
            if (element) {
                window.clearInterval(intervalId);
                resolve(element as T);
                return;
            }

            if (attempts >= maxAttempts) {
                window.clearInterval(intervalId);
                reject(
                    new Error(`Timed out waiting for selector: ${selector}`),
                );
            }
        }, POLL_INTERVAL_MS);
    });
};

const mouseEventInit = (): MouseEventInit => ({
    bubbles: true,
    cancelable: true,
    view: window,
    button: 0,
});

/**
 * ChatGPT / Radix controls often ignore a bare MouseEvent("click").
 * Mirror a real pointer interaction, then call the native click() hook.
 */
const activateElement = (element: HTMLElement): void => {
    if (typeof element.scrollIntoView === "function") {
        element.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    const eventInit = mouseEventInit();

    if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(
            new PointerEvent("pointerdown", {
                ...eventInit,
                pointerType: "mouse",
            }),
        );
    }

    // Radix Tabs activates on mousedown. Programmatically dispatched pointer
    // events do not synthesize their corresponding mouse events.
    element.dispatchEvent(new MouseEvent("mousedown", eventInit));

    if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(
            new PointerEvent("pointerup", {
                ...eventInit,
                pointerType: "mouse",
            }),
        );
    }
    element.dispatchEvent(new MouseEvent("mouseup", eventInit));

    // HTMLElement.click() follows the native click path through React's
    // delegated handler. Do not dispatch an additional click event.
    element.click();
};

const openProfileMenu = (profileButton: HTMLElement): void => {
    activateElement(profileButton);
};

/** Runtime hooks; `reload` is stubbed in unit tests (jsdom locks location.reload). */
export const deleteAllChatsRuntime = {
    reload: (): void => {
        window.location.reload();
    },
};

/**
 * Drives ChatGPT's native delete-all UI:
 * Profile → Settings → Data controls → Delete all → Confirm.
 * Resolves only after the confirm click, or with FAILURE when a step is
 * missing / times out. Intervals are always cleared.
 */
export const deleteAllChats = async (): Promise<DeleteAllChatsResult> => {
    try {
        const chatHistory = document.querySelectorAll(CHAT_HISTORY_SELECTOR);
        if (chatHistory.length === 0) {
            return { status: "FAILURE", message: "No chat history found" };
        }

        const profileButton = findVisibleProfileButton();
        if (!profileButton) {
            return { status: "FAILURE", message: "Profile button not found!" };
        }

        openProfileMenu(profileButton);

        const settingsMenuItem = await waitForElement<HTMLElement>(
            SETTINGS_MENU_ITEM_SELECTOR,
        );
        activateElement(settingsMenuItem);

        const dataControlsTab = await waitForElement<HTMLElement>(
            DATA_CONTROLS_TAB_SELECTOR,
        );
        activateElement(dataControlsTab);

        // Ensure the tab actually became active before looking for Delete all.
        await waitForElement<HTMLElement>(
            `${DATA_CONTROLS_TAB_SELECTOR}[data-state="active"], ${DATA_CONTROLS_TAB_SELECTOR}[aria-selected="true"]`,
        );

        const deleteAllChatsButton = await waitForElement<HTMLElement>(
            DELETE_ALL_BUTTON_SELECTOR,
        );
        activateElement(deleteAllChatsButton);

        const confirmDeleteButton = await waitForElement<HTMLElement>(
            CONFIRM_DELETE_BUTTON_SELECTOR,
        );
        activateElement(confirmDeleteButton);

        // ChatGPT can leave the deleted conversation open; reload clears it.
        // Defer so the popup still receives SUCCESS before navigation.
        window.setTimeout(() => {
            deleteAllChatsRuntime.reload();
        }, 0);

        return { status: "SUCCESS" };
    } catch (error) {
        console.error(error);
        return {
            status: "FAILURE",
            message:
                error instanceof Error
                    ? error.message
                    : String(error) || "Failed to delete chats",
        };
    }
};
