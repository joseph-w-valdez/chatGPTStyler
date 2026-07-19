import React, { useState } from "react";
import css from "./styles.module.css";
import {
    DeleteMessagesMessage,
    DeleteMessagesResponse,
} from "@src/shared/messaging";

const isChatGptUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com");
    } catch {
        return false;
    }
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
        setIsLoading(true);
        setError(null);
        setSuccessful(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                finishWithMessage("Active tab is not ChatGPT", null);
                return;
            }

            const message: DeleteMessagesMessage = {
                action: "deleteMessages",
            };

            chrome.tabs.sendMessage(
                tab.id,
                message,
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
                type="button"
                className={showConfirmButtons ? "hidden" : css.bigRedBtn}
                disabled={isLoading || !!error || !!success}
                onClick={handleClick}
                aria-expanded={showConfirmButtons}
                aria-controls="delete-all-confirm"
            >
                Delete All Conversations
            </button>
            {(error || success) && (
                <p
                    role="status"
                    aria-live="polite"
                    className={
                        (error && css.errorMsg) || (success && css.successMsg)
                    }
                >
                    {error || success}
                </p>
            )}
            <div
                id="delete-all-confirm"
                className={
                    showConfirmButtons
                        ? "grid place-items-center gap-2"
                        : "hidden"
                }
                role={showConfirmButtons ? "group" : undefined}
                aria-labelledby={
                    showConfirmButtons ? "delete-all-confirm-label" : undefined
                }
            >
                <div className="w-full grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className={css.yesBtn}
                        disabled={isLoading}
                        onClick={requestDeleteAllChats}
                        aria-describedby="delete-all-confirm-label"
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        className={css.noBtn}
                        disabled={isLoading}
                        onClick={handleClick}
                        aria-describedby="delete-all-confirm-label"
                    >
                        No
                    </button>
                </div>
                <p
                    id="delete-all-confirm-label"
                    className="text-sm text-ink-muted"
                >
                    Are you sure?
                </p>
            </div>
        </div>
    );
}
