import React, { useEffect, useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { ColorControls } from "./components/ColorControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { MessageSliderControls } from "./components/MessageSliderControls";

export interface MessageEditorProps {
    settings: SettingsType;
    setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function MessageEditor({
    settings,
    setSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [liveChanges, setLiveChanges] = useState<SettingsType>({
        ...settings,
    });

    useEffect(() => {setSettings(liveChanges)}, [liveChanges]);

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pb-2 ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <MessageSliderControls
                setLiveChanges={setLiveChanges}
                liveChanges={liveChanges}
                setIsEditing={setIsEditing}
            />
            <ColorControls
                setLiveChanges={setLiveChanges}
                liveChanges={liveChanges}
                setIsEditing={setIsEditing}
            />
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
