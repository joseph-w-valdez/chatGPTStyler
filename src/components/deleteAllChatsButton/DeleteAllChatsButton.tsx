import React, { useState } from "react";
import css from "./styles.module.css";

export function DeleteAllChatsButton(): JSX.Element {
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleClick = (): void => {
        setShowConfirmButtons(!showConfirmButtons);
    };

    /**
     * Checks if active tab is ChatGPT.
     * If so, we attempt to delete all messages.
     * If active tab is not ChatGPT or there is no message history, show an error to the user.
     */
    const deleteAllChats = (): void => {
        console.log("Sending Message to Content Script: Deleting All Messages");

        setIsLoading(true);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].title === "ChatGPT") {
                console.log("activeTab", tabs[0]);
                chrome.tabs.sendMessage(
                    tabs[0].id || 0,
                    { action: "deleteMessages" },
                    (response) => {
                        console.log("Response from content script:", response);
                        if (response.status === "FAILURE") {
                            setError(response.message);
                            setTimeout(() => {
                                setError(null);
                            }, 5000);
                        }
                    },
                );
            } else {
                console.error("Active tab is not ChatGPT");
                setError("Active tab is not ChatGPT");
                setTimeout(() => {
                    setError(null);
                }, 5000);
            }
            setIsLoading(false);
            setShowConfirmButtons(false);
        });
    };
    return (
        <div>
            <button
                className={showConfirmButtons ? "hidden" : css.bigRedBtn}
                onClick={handleClick}
            >
                Delete All Conversations
            </button>
            {error && <h1 className={css.errorMsg}>{error}</h1>}
            <div
                className={
                    showConfirmButtons
                        ? "grid place-items-center gap-2"
                        : "hidden"
                }
            >
                <h1 className="text-base">Are you sure?</h1>
                <div className="w-full grid grid-cols-2 gap-2">
                    <button
                        className={css.yesBtn}
                        disabled={isLoading}
                        onClick={deleteAllChats}
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
            </div>
        </div>
    );
}
