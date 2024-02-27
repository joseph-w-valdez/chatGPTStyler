import React, { useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { FormButtons } from "@src/components/formButtons/FormButtons";

export interface MessageEditorProps {
    settings: SettingsType;
    setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function MiscEditor({
    settings,
    setSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [liveChanges, setLiveChanges] = useState<SettingsType>({
        ...settings,
    });

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pb-2 ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <div className="flex justify-between group hover:bg-slate-500/20">
                <label
                    htmlFor="messageButtonsVisibilityStyle"
                    className="w-full p-2 hover:cursor-pointer"
                >
                    Show Chat Message Buttons
                </label>
                <input
                    id="messageButtonsVisibilityStyle"
                    type="checkbox"
                    className=" hover:cursor-pointer"
                />
            </div>
            <FormButtons
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                liveChanges={liveChanges}
                setLiveChanges={setLiveChanges}
                settings={settings}
                setSettings={setSettings}
            />
        </div>
    );
}
