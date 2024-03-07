import React, { useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { ColorControls } from "./components/colorControl/component";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { MessageSliderControls } from "./components/messageSliderControls";

export interface MessageEditorProps {
    liveSettings: SettingsType;
    setLiveSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}
export function MessageEditor({
    liveSettings,
    setLiveSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [savedSettings, setSavedSettings] = useState<SettingsType>({
        ...liveSettings,
    });

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pb-2 ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <MessageSliderControls
                setLiveChanges={setLiveSettings}
                liveChanges={liveSettings}
                setIsEditing={setIsEditing}
            />
            <ColorControls
                setLiveChanges={setLiveSettings}
                liveChanges={liveSettings}
                setIsEditing={setIsEditing}
            />
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
