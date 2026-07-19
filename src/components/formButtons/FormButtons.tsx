import React from "react";
import css from "./styles.module.css";
import { saveOptionsToStorage } from "@src/lib/utilities/settingsStorage";
import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";

export interface FormButtonsProps {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    liveSettings: Settings;
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    savedSettings: Settings;
    setSavedSettings: React.Dispatch<React.SetStateAction<Settings>>;
    onRestoreDefaults: () => void;
}

export function FormButtons({
    isEditing,
    setIsEditing,
    liveSettings,
    setLiveSettings,
    savedSettings,
    setSavedSettings,
    onRestoreDefaults,
}: FormButtonsProps): JSX.Element {
    return (
        <div
            className="grid grid-cols-4 gap-1"
            role="group"
            aria-label="Settings actions"
        >
            <button
                type="button"
                className={`${css.btnGrey} col-span-2`}
                onClick={onRestoreDefaults}
            >
                Restore Defaults
            </button>
            <button
                type="button"
                disabled={!isEditing}
                className={`${css.btn}`}
                onClick={() => {
                    saveOptionsToStorage(liveSettings);
                    setSavedSettings({ ...liveSettings });
                    setIsEditing(false);
                }}
            >
                Save
            </button>
            <button
                type="button"
                disabled={!isEditing}
                className={`${css.btnRed}`}
                onClick={() => {
                    setLiveSettings({ ...savedSettings });
                    sendMessageToTab({ ...savedSettings });
                    setIsEditing(false);
                }}
            >
                Cancel
            </button>
        </div>
    );
}
