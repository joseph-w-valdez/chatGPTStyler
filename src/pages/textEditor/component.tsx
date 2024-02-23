import React, { useEffect } from "react";
import { useState } from "react";
import { TextFormControls } from "@src/components/textFormControls";
import {
    SettingsType,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import css from "./styles.module.css";

interface TextEditorProps {
    settings: SettingsType;
    setOptions: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function TextEditor({
    settings,
    setOptions,
}: TextEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [liveChanges, setLiveChanges] = useState<SettingsType>(settings);

    // useEffect(() => {
    //     getOptionsFromStorage((savedOptions) => {
    //         setOptions(savedOptions);
    //         setLiveSettings(savedOptions);
    //         console.log(liveSettings);
    //     });
    // }, []);

    const sendMessageToRuntime = (action: string, value: number | string) => {
        setIsEditing(true);
        console.log("action", action);
        console.log("value", value);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: action,
                arg: value,
            });
        });
    };
    return (
        <div className="grid grid-cols-1 gap-4">
            <TextFormControls
                settingsOptions={"Size"}
                liveChanges={liveChanges}
                setLiveChanges={setLiveChanges}
                applyUpdates={sendMessageToRuntime}
            />
            <TextFormControls
                settingsOptions={"Weight"}
                liveChanges={liveChanges}
                setLiveChanges={setLiveChanges}
                applyUpdates={sendMessageToRuntime}
            />
            <div className="grid grid-cols-4 gap-1">
                <button
                    className={`${css.btn} col-span-2`}
                    onClick={() => {
                        setLiveChanges({
                            messageMaxWidthStyle: "95",
                            messageColorUserStyle: "",
                            messageColorNonUserStyle: "",
                            messagePaddingStyle: "10",
                            messageBorderRadiusStyle: "5",
                            inputBoxMaxWidthStyle: "70",
                            textColorUserStyle: "",
                            textColorNonUserStyle: "",
                            textSizeUserStyle: "",
                            textSizeNonUserStyle: "",
                            textWeightUserStyle: "",
                            textWeightNonUserStyle: "",
                        });
                        sendMessageToRuntime("restoreDefaultSettings", "");
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
                        setLiveChanges(liveChanges);
                        setIsEditing(false);
                    }}
                >
                    Save
                </button>
                <button
                    disabled={!isEditing}
                    className={`${css.btnRed}`}
                    onClick={() => {
                        setOptions({ ...liveChanges });
                        sendMessageToRuntime("restoreUserSettings", "");
                        setIsEditing(false);
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
