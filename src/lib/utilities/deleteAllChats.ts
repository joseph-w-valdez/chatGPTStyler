export const deleteAllChats = (): Error | void => {
    try {
        //querySelector may need to be updated if the domain updates their html
        const chatHistory = document.querySelector(
            "div.group\\/sidebar> div.flex.flex-col.gap-2.text-token-text-primary.text-sm.false.mt-5.pb-2",
        );

        if (!chatHistory) throw new Error("No chat history found");

        //querySelector may need to be updated if the domain updates their html
        const profileButton = document.querySelector(
            '[aria-label="Open Profile Menu"]',
        ) as HTMLButtonElement;

        if (!profileButton) throw new Error("Profile button not found!");

        // pointerdown and pointerup events needs to be manually set. click() and mouseclick events for certain elements
        profileButton.dispatchEvent(
            new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,
                pointerType: "mouse",
            }),
        );

        profileButton.dispatchEvent(
            new PointerEvent("pointerup", {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,
                pointerType: "mouse",
            }),
        );

        //querySelector may need to be updated if the domain updates their html
        const settingsMenuItem = document.querySelector(
            '[data-testid="settings-menu-item"]',
        ) as HTMLButtonElement;

        if (!settingsMenuItem) throw new Error("Settings menu item not found!");

        settingsMenuItem.click();

        const checkDeleteAllChatsButton = setInterval(() => {
            //querySelector may need to be updated if the domain updates their html
            const deleteAllChatsButton = document.querySelector(
                '[data-testid="delete-all-chats-button"]',
            ) as HTMLButtonElement;
            if (deleteAllChatsButton) {
                deleteAllChatsButton.dispatchEvent(
                    new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                    }),
                );
                clearInterval(checkDeleteAllChatsButton);
            } else {
                throw new Error("Delete all chats button not found!");
            }
        }, 100);

        const checkConfirmDeleteButton = setInterval(() => {
            //querySelector may need to be updated if the domain updates their html
            const confirmDeleteButton = document.querySelector(
                '[data-testid="confirm-delete-all-chats-button"]',
            ) as HTMLButtonElement;
            if (confirmDeleteButton) {
                confirmDeleteButton.click();
                clearInterval(checkConfirmDeleteButton);
            } else {
                throw new Error("Confirm delete button not found!");
            }
        }, 100);
    } catch (error) {
        console.error(error);
        return error as Error;
    }
};
