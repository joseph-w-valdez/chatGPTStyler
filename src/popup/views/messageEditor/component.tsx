import React, { useState } from "react";
import { SettingsType } from "@src/lib/utilities/googleStorage";
import { ColorControls } from "./components/ColorControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { MessageSliderControls } from "./components/MessageSliderControls";
// import * as update from "@src/shared/utils";

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
    // const sendMessageToTab = (
    //     action: keyof SettingsType | "restoreSettings",
    //     value?: string | SettingsType,
    // ) => {
    //     let cssTextContent = "";
    //     console.log("VALUE PASSED", value);
    //     if (action === "restoreSettings" && typeof value !== "string")
    //         cssTextContent = update.loadSettings(value);
    //     else if (action !== "restoreSettings" && typeof value === "string")
    //         cssTextContent = update.updateStyles(action, value);
    //     setIsEditing(true);
    //     console.log("CSS GENERATED", cssTextContent);
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         chrome.tabs.sendMessage(tabs[0].id || 0, {
    //             action: "updateStyles",
    //             arg: cssTextContent,
    //         });
    //     });
    // };
    const sendMessageToTab = (
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
                sendMessageToRuntime={sendMessageToTab}
            />
            <ColorControls
                setLiveChanges={setLiveChanges}
                liveChanges={liveChanges}
                sendMessageToRuntime={sendMessageToTab}
            />
            <FormButtons
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                liveChanges={liveChanges}
                setLiveChanges={setLiveChanges}
                settings={settings}
                setSettings={setSettings}
                sendMessageToRuntime={sendMessageToTab}
            />
        </div>
    );
}
