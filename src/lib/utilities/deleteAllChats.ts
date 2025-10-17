export const deleteAllChats = (): Error | void => {
    try {
        //querySelector may need to be updated if the domain updates their html
        const chatHistory = document.querySelector("#history");

        if (!chatHistory || chatHistory?.children.length === 0)
            throw new Error("No chat history found");

        //querySelector may need to be updated if the domain updates their html
        const profileButton = document.querySelector(
            '[aria-label="Open profile menu"]',
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

        const checkSettingsMenuItem = setInterval(() => {
            //querySelector may need to be updated if the domain updates their html
            const settingsMenuItem = document.querySelector(
                '[data-testid="settings-menu-item"]',
            ) as HTMLDivElement;
            if (settingsMenuItem) {
                settingsMenuItem.dispatchEvent(
                    new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                    }),
                );
                clearInterval(checkSettingsMenuItem);
            } else {
                throw new Error("Settings menu not found!");
            }
        }, 100);

        const checkDataControlsButton = setInterval(() => {
            //querySelector may need to be updated if the domain updates their html
            const dataControlsButton = document.querySelector(
                '[data-testid="data-controls-tab"]',
            ) as HTMLButtonElement;

            if (dataControlsButton) {
                dataControlsButton.focus();
                dataControlsButton.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "Enter",
                        bubbles: true,
                    }),
                );
                dataControlsButton.dispatchEvent(
                    new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
                );
                clearInterval(checkDataControlsButton);
            } else {
                throw new Error("Data controls button not found!");
            }
        }, 100);

        const checkDeleteAllChatsButton = setInterval(() => {
            //querySelector may need to be updated if the domain updates their html
            const deleteAllChatsButton = document.querySelector(
                "button.btn-danger-outline",
            ) as HTMLButtonElement;
            if (deleteAllChatsButton) {
                deleteAllChatsButton.click();
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
