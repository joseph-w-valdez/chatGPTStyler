import React, { useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { sendMessageToTab } from "@src/shared/utils";

export interface MessageEditorProps {
    liveSettings: SettingsType;
    setLiveSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function MiscEditor({
    liveSettings,
    setLiveSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [savedSettings, setSavedSettings] = useState<SettingsType>({
        ...liveSettings,
    });

    return (
        <div className="flex flex-col h-full justify-between px-3 pb-2">
            <div
                className={`grid grid-cols-1 gap-y-3 w-full ${
                    !isEditing ? "animate-fade-in" : ""
                }`}
            >
                <label className="flex justify-between group p-2 hover:cursor-pointer hover:bg-slate-500/20 duration-100">
                    Show Chat Message Buttons
                    <input
                        type="checkbox"
                        checked={liveSettings.messageButtonsVisibilityStyle}
                        onChange={() => {
                            setLiveSettings({
                                ...liveSettings,
                                messageButtonsVisibilityStyle:
                                    !liveSettings.messageButtonsVisibilityStyle,
                            });
                            sendMessageToTab(
                                "messageButtonsVisibilityStyle",
                                !liveSettings.messageButtonsVisibilityStyle,
                            );
                            setIsEditing(true);
                        }}
                        className=" hover:cursor-pointer"
                    />
                </label>
            </div>
            <FormButtons
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                liveSettings={liveSettings}
                setLiveSettings={setLiveSettings}
                savedSettings={savedSettings}
                setSavedSettings={setSavedSettings}
            />
        </div>
    );
}
