import React, { useState } from "react";
import css from "./styles.module.css";

const isChatGptUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com");
    } catch {
        return false;
    }
};

type DeleteMessagesResponse = {
    status?: "SUCCESS" | "FAILURE";
    message?: string;
};

export function DeleteAllChatsButton(): JSX.Element {
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccessful] = useState<string | null>(null);

    const handleClick = (): void => {
        setError(null);
        setSuccessful(null);
        setShowConfirmButtons(!showConfirmButtons);
    };

    const finishWithMessage = (
        nextError: string | null,
        nextSuccess: string | null,
    ): void => {
        setError(nextError);
        setSuccessful(nextSuccess);
        setIsLoading(false);
        setShowConfirmButtons(false);
        window.setTimeout(() => {
            setError(null);
            setSuccessful(null);
        }, 5000);
    };

    /**
     * Checks if active tab is ChatGPT, then asks the content script to run
     * delete-all. Success/failure UI follows the content-script response.
     */
    const requestDeleteAllChats = (): void => {
        console.log("Sending Message to Content Script: Deleting All Messages");

        setIsLoading(true);
        setError(null);
        setSuccessful(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                finishWithMessage("Active tab is not ChatGPT", null);
                return;
            }

            chrome.tabs.sendMessage(
                tab.id,
                { action: "deleteMessages" },
                (response: DeleteMessagesResponse | undefined) => {
                    if (chrome.runtime.lastError) {
                        finishWithMessage(
                            chrome.runtime.lastError.message ||
                                "Failed to reach the ChatGPT tab",
                            null,
                        );
                        return;
                    }

                    if (response?.status === "SUCCESS") {
                        finishWithMessage(null, "All chats have been deleted!");
                        return;
                    }

                    finishWithMessage(
                        response?.message || "Failed to delete chats",
                        null,
                    );
                },
            );
        });
    };

    return (
        <div>
            <button
                className={showConfirmButtons ? "hidden" : css.bigRedBtn}
                disabled={isLoading || !!error || !!success}
                onClick={handleClick}
            >
                Delete All Conversations
            </button>
            {(error || success) && (
                <h1
                    className={
                        (error && css.errorMsg) || (success && css.successMsg)
                    }
                >
                    {error || success}
                </h1>
            )}
            <div
                className={
                    showConfirmButtons
                        ? "grid place-items-center gap-2"
                        : "hidden"
                }
            >
                <div className="w-full grid grid-cols-2 gap-2">
                    <button
                        className={css.yesBtn}
                        disabled={isLoading}
                        onClick={requestDeleteAllChats}
                    >
                        Yes
                    </button>
                    <button
                        className={css.noBtn}
                        disabled={isLoading}
                        onClick={handleClick}
                    >
                        No
                    </button>
                </div>
                <h1 className="text-base">Are you sure?</h1>
            </div>
        </div>
    );
}
