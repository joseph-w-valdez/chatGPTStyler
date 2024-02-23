import React, { useEffect, useState } from "react";
import {
    SettingsType,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import { MessageFormControl } from "@src/components/messageFormControl";
import css from "./styles.module.css";

export interface MessageEditorProps {
    settings: SettingsType;
    setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

export function MessageEditor({
    settings,
    setSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [liveChanges, setLiveChanges] = useState<SettingsType>(settings);
    const sendMessageToRuntime = (
        action: string,
        value: number | string | SettingsType,
    ) => {
        setIsEditing(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: action,
                arg: value,
            });
        });
    };

    // useEffect(() => {
    //     getOptionsFromStorage((savedOptions) => {
    //         setSettings(savedOptions);
    //         setLiveChanges(savedOptions);
    //     });
    // }, []);

    class InputSetting {
        name: string = "";
        id: keyof SettingsType = "messageMaxWidthStyle";
        valueType: "px" | "%" = "px";

        constructor(
            name: string,
            id: keyof SettingsType = "messageMaxWidthStyle",
            valueType: "px" | "%" = "px",
        ) {
            this.name = name;
            this.id = id;
            this.valueType = valueType;
        }
    }
    const inputSettings = [
        new InputSetting("Message Width", "messageMaxWidthStyle", "%"),
        new InputSetting("Message Padding", "messagePaddingStyle", "px"),
        new InputSetting("Message Border", "messageBorderRadiusStyle", "px"),
        new InputSetting("Input Box Width", "inputBoxMaxWidthStyle", "%"),
    ];

    const mapInputSettings = (setting: InputSetting, index: number) => {
        const bgColors = [
            "rgba(145, 10, 103",
            "rgba(114, 4, 85",
            "rgba(60, 7, 83",
            "rgba(3, 6, 55",
        ];
        return (
            <div className="flex justify-between items-center" key={index}>
                <label
                    htmlFor={setting.id}
                    className={`basis-1/2 p-2 text-white rounded-md font-medium text-center mr-2`}
                    style={{
                        backgroundColor: `${bgColors[index]})`,
                    }}
                >{`${setting.name}:`}</label>{" "}
                <div className="relative flex ">
                    <input
                        className={`outline-none px-2 py-2 text-right w-full rounded-l-sm`}
                        type="text"
                        maxLength={2}
                        style={{
                            backgroundColor: `${bgColors[index]}, 0.1)`,
                        }}
                        value={liveChanges[setting.id]}
                        id={setting.id}
                        onChange={(e) => {
                            sendMessageToRuntime(
                                setting.id,
                                Number(e.currentTarget.value),
                            );
                            setLiveChanges({
                                ...liveChanges,
                                [setting.id]: e.currentTarget.value,
                            });
                        }}
                    ></input>
                    <input
                        type="range"
                        min="1"
                        max="95"
                        value={liveChanges[setting.id]}
                        className="absolute w-full h-0.5 left-0 bottom-0"
                        onChange={(e) => {
                            sendMessageToRuntime(
                                setting.id,
                                Number(e.currentTarget.value),
                            );
                            setLiveChanges({
                                ...liveChanges,
                                [setting.id]: e.currentTarget.value,
                            });
                        }}
                        step={"1"}
                        style={{ accentColor: `${bgColors[index]})` }}
                    ></input>
                </div>
                <div
                    className={`py-2 rounded-r-sm`}
                    style={{
                        backgroundColor: `${bgColors[index]}, 0.1)`,
                    }}
                >
                    {setting.valueType}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 ${
                !isEditing ? "animate-fade-in" : ""
            } px-3 pb-2`}
        >
            {inputSettings.map(mapInputSettings)}
            <div className="grid grid-cols-2 gap-2 place-items-center">
                <MessageFormControl
                    settingsOptions={"message"}
                    setLiveChanges={setLiveChanges}
                    liveChanges={liveChanges}
                    applyUpdates={sendMessageToRuntime}
                />
                <MessageFormControl
                    settingsOptions={"text"}
                    setLiveChanges={setLiveChanges}
                    liveChanges={liveChanges}
                    applyUpdates={sendMessageToRuntime}
                />
            </div>
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
                    // className={`${css.btn}`}
                    className={`${css.btn}`}
                    onClick={() => {
                        saveOptionsToStorage(liveChanges);
                        setSettings(liveChanges);
                        setIsEditing(false);
                    }}
                >
                    Save
                </button>
                <button
                    disabled={!isEditing}
                    // className={`${css.btn}`}
                    className={`${css.btnRed}`}
                    onClick={() => {
                        setLiveChanges(settings);
                        sendMessageToRuntime("restoreUserSettings", settings);
                        setIsEditing(false);
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
