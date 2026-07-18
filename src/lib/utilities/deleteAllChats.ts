export type DeleteAllChatsResult =
    | { status: "SUCCESS" }
    | { status: "FAILURE"; message: string };

const POLL_INTERVAL_MS = 100;
const DEFAULT_TIMEOUT_MS = 10000;

const CHAT_HISTORY_SELECTOR = "div.group\\/sidebar > div:nth-child(3)";
const PROFILE_BUTTON_SELECTOR = '[aria-label="Open Profile Menu"]';
const SETTINGS_MENU_ITEM_SELECTOR = '[data-testid="settings-menu-item"]';
const DELETE_ALL_BUTTON_SELECTOR = '[data-testid="delete-all-chats-button"]';
const CONFIRM_DELETE_BUTTON_SELECTOR =
    '[data-testid="confirm-delete-all-chats-button"]';

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

const openProfileMenu = (profileButton: HTMLElement): void => {
    // pointerdown/up are required for ChatGPT's profile menu in the browser.
    // Fall back to mouse events in test environments without PointerEvent.
    const eventInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
    };

    if (typeof PointerEvent !== "undefined") {
        profileButton.dispatchEvent(
            new PointerEvent("pointerdown", {
                ...eventInit,
                pointerType: "mouse",
            }),
        );
        profileButton.dispatchEvent(
            new PointerEvent("pointerup", {
                ...eventInit,
                pointerType: "mouse",
            }),
        );
        return;
    }

    profileButton.dispatchEvent(new MouseEvent("mousedown", eventInit));
    profileButton.dispatchEvent(new MouseEvent("mouseup", eventInit));
    profileButton.dispatchEvent(new MouseEvent("click", eventInit));
};

/**
 * Drives ChatGPT's native delete-all UI. Resolves only after the confirm click,
 * or with FAILURE when a step is missing / times out. Intervals are always cleared.
 */
export const deleteAllChats = async (): Promise<DeleteAllChatsResult> => {
    try {
        const chatHistory = document.querySelector(CHAT_HISTORY_SELECTOR);
        if (!chatHistory || chatHistory.children.length === 0) {
            return { status: "FAILURE", message: "No chat history found" };
        }

        const profileButton = document.querySelector(
            PROFILE_BUTTON_SELECTOR,
        ) as HTMLButtonElement | null;
        if (!profileButton) {
            return { status: "FAILURE", message: "Profile button not found!" };
        }

        openProfileMenu(profileButton);

        const settingsMenuItem = await waitForElement<HTMLButtonElement>(
            SETTINGS_MENU_ITEM_SELECTOR,
        );
        settingsMenuItem.click();

        const deleteAllChatsButton = await waitForElement<HTMLButtonElement>(
            DELETE_ALL_BUTTON_SELECTOR,
        );
        deleteAllChatsButton.dispatchEvent(
            new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,
            }),
        );

        const confirmDeleteButton = await waitForElement<HTMLButtonElement>(
            CONFIRM_DELETE_BUTTON_SELECTOR,
        );
        confirmDeleteButton.click();

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
