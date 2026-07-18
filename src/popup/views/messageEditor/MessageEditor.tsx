import React, { useState, useEffect } from "react";
import { Settings } from "@src/shared/settings";
import { ColorControls } from "./components/colorControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { MessageSliderControls } from "./components/messageSliderControls";
import { DeleteAllChatsButton } from "@src/components/deleteAllChatsButton/DeleteAllChatsButton";
import { SelectorHealthCheck } from "@src/components/selectorHealthCheck";

export interface MessageEditorProps {
    liveSettings: Settings;
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function MessageEditor({
    liveSettings,
    setLiveSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [savedSettings, setSavedSettings] = useState<Settings>({
        ...liveSettings,
    });

    // Keep Cancel's baseline in sync with storage-loaded / saved settings.
    // While editing, leave savedSettings alone so Cancel can restore them.
    useEffect(() => {
        if (!isEditing) {
            setSavedSettings({ ...liveSettings });
        }
    }, [liveSettings, isEditing]);

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pb-2 select-none ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <MessageSliderControls
                setLiveSettings={setLiveSettings}
                liveSettings={liveSettings}
                setIsEditing={setIsEditing}
            />
            <ColorControls
                setLiveSettings={setLiveSettings}
                liveSettings={liveSettings}
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
            <DeleteAllChatsButton />
            {process.env.NODE_ENV === "development" ? (
                <SelectorHealthCheck />
            ) : null}
        </div>
    );
}
