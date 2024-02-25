import React, { useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { MessageFormControl } from "@src/components/messageFormControl";
import { FormButtons } from "@src/components/formButtons/component";
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
    const sendMessageToRuntime = (
        action: keyof SettingsType | "restoreSettings",
        value?: number | string | SettingsType,
    ) => {
        setIsEditing(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: action,
                arg: value,
            });
        });
    };

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pb-2 ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <MessageSliderControls
                setLiveChanges={setLiveChanges}
                liveChanges={liveChanges}
                sendMessageToRuntime={sendMessageToRuntime}
            />
            <MessageFormControl
                setLiveChanges={setLiveChanges}
                liveChanges={liveChanges}
                sendMessageToRuntime={sendMessageToRuntime}
            />
            <FormButtons
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                liveChanges={liveChanges}
                setLiveChanges={setLiveChanges}
                settings={settings}
                setSettings={setSettings}
                sendMessageToRuntime={sendMessageToRuntime}
            />
        </div>
    );
}
