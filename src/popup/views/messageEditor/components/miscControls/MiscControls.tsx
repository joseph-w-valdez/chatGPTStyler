import React from "react";
import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";
import { DeleteAllChatsButton } from "@src/components/deleteAllChatsButton/DeleteAllChatsButton";

export interface MiscControlsProps {
    liveSettings: Settings;
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MiscControls({
    liveSettings,
    setLiveSettings,
    setIsEditing,
}: MiscControlsProps): JSX.Element {
    const handleScrollToTopChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const nextSettings = {
            ...liveSettings,
            scrollToTopEnabled: event.currentTarget.checked,
        };

        setLiveSettings(nextSettings);
        sendMessageToTab(nextSettings);
        setIsEditing(true);
    };

    return (
        <div className="grid gap-4">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-surface-raised p-3 text-sm text-ink cursor-pointer">
                <span className="font-medium">Scroll to top button</span>
                <input
                    type="checkbox"
                    aria-label="Enable scroll to top button"
                    checked={liveSettings.scrollToTopEnabled}
                    onChange={handleScrollToTopChange}
                />
            </label>

            <div className="grid gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    Conversation data
                </p>
                <DeleteAllChatsButton />
            </div>
        </div>
    );
}
