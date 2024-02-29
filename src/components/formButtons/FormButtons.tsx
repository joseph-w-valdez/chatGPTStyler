import React from "react";
import css from "./styles.module.css";
import {
    SettingsType,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import { defaultSettings } from "@src/shared/utils/data";
import { sendMessageToTab } from "@src/shared/utils";

interface FormButtonsProps {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    liveSettings: SettingsType;
    setLiveSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
    savedSettings: SettingsType;
    setSavedSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function FormButtons({
    isEditing,
    setIsEditing,
    liveSettings,
    setLiveSettings,
    savedSettings,
    setSavedSettings,
}: FormButtonsProps): JSX.Element {
    return (
        <div className="grid grid-cols-4 gap-1">
            <button
                className={`${css.btnGrey} col-span-2`}
                onClick={() => {
                    setLiveSettings({ ...defaultSettings });
                    sendMessageToTab("restoreSettings", {
                        ...defaultSettings,
                    });
                    setIsEditing(true);
                }}
            >
                Restore Default
            </button>
            <button
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
                disabled={!isEditing}
                className={`${css.btnRed}`}
                onClick={() => {
                    setLiveSettings({ ...savedSettings });
                    console.log("jdjdsad", savedSettings);
                    sendMessageToTab("restoreSettings", savedSettings);
                    setIsEditing(false);
                }}
            >
                Cancel
            </button>
        </div>
    );
}
