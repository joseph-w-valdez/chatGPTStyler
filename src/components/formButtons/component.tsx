import React from "react";
import css from "./styles.module.css";
import {
    SettingsType,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import { defaultSettings } from "@src/shared/utils/data";

interface FormButtonsProps {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    liveChanges: SettingsType;
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    settings: SettingsType;
    setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
    sendMessageToRuntime: (
        action: keyof SettingsType | "restoreSettings",
        value?: string | SettingsType,
    ) => void;
}

export function FormButtons({
    isEditing,
    setIsEditing,
    liveChanges,
    setLiveChanges,
    settings,
    setSettings,
    sendMessageToRuntime,
}: FormButtonsProps): JSX.Element {
    return (
        <div className="grid grid-cols-4 gap-1">
            <button
                className={`${css.btnGrey} col-span-2`}
                onClick={() => {
                    setLiveChanges({ ...defaultSettings });
                    sendMessageToRuntime("restoreSettings");
                    setIsEditing(true);
                }}
            >
                Restore Default
            </button>
            <button
                disabled={!isEditing}
                className={`${css.btn}`}
                onClick={() => {
                    saveOptionsToStorage(liveChanges);
                    setSettings({ ...liveChanges });
                    setIsEditing(false);
                }}
            >
                Save
            </button>
            <button
                disabled={!isEditing}
                className={`${css.btnRed}`}
                onClick={() => {
                    setLiveChanges({ ...settings });
                    sendMessageToRuntime("restoreSettings", settings);
                    setIsEditing(false);
                }}
            >
                Cancel
            </button>
        </div>
    );
}
