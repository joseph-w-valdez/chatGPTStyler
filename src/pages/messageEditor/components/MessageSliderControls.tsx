import { SettingsType } from "@src/lib/utilities/googleStorage";
import React from "react";

export interface MessageSliderControlsProps {
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    sendMessageToRuntime: (
        action: keyof SettingsType | "restoreSettings",
        value?: string | SettingsType,
    ) => void;
}
export type colorSetting = "messageColor" | "textColor";

export function MessageSliderControls({
    setLiveChanges,
    liveChanges,
    sendMessageToRuntime,
}: MessageSliderControlsProps): JSX.Element {
    // using this to create data we need so we can map through and have clean callback
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
                                e.currentTarget.value,
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
                                e.currentTarget.value,
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
        <div className={`grid grid-cols-1 gap-y-3 `}>
            {inputSettings.map(mapInputSettings)}
        </div>
    );
}
