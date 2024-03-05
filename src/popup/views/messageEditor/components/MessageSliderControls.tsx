import { SettingsType } from "@src/lib/utilities/googleStorage";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface SliderControlsProps {
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}
export type colorSetting = "messageColor" | "textColor";

export function MessageSliderControls({
    setLiveChanges,
    liveChanges,
    setIsEditing,
}: SliderControlsProps): JSX.Element {
    // using this to create data we need so we can map through and have clean callback
    class InputSetting {
        name: string = "";
        id: keyof SettingsType = "messageMaxWidthStyle";
        valueType: "px" | "%" = "px";
        bgColor: string = "";

        constructor(settingsProperties: InputSetting) {
            this.name = settingsProperties.name;
            this.id = settingsProperties.id;
            this.valueType = settingsProperties.valueType;
            this.bgColor = settingsProperties.bgColor;
        }
    }
    const inputSettings = [
        new InputSetting({
            name: "Message Width",
            id: "messageMaxWidthStyle",
            valueType: "%",
            bgColor: "rgba(145, 10, 103",
        }),
        new InputSetting({
            name: "Message Padding",
            id: "messagePaddingStyle",
            valueType: "px",
            bgColor: "rgba(114, 4, 85",
        }),
        new InputSetting({
            name: "Message Border",
            id: "messageBorderRadiusStyle",
            valueType: "px",
            bgColor: "rgba(60, 7, 83",
        }),
        new InputSetting({
            name: "Input Box Width",
            id: "inputBoxMaxWidthStyle",
            valueType: "%",
            bgColor: "rgba(3, 6, 55",
        }),
    ];

    const mapInputSettings = (setting: InputSetting, index: number) => {
        const handleOnChange = (
            e: React.ChangeEvent<HTMLInputElement>,
            settingKey: keyof SettingsType,
        ) => {
            const regex = /^\d+$/;
            if (regex.test(e.target.value)) {
                setIsEditing(true);
                sendMessageToTab(settingKey, e.currentTarget.value);
                setLiveChanges({
                    ...liveChanges,
                    [settingKey]: e.currentTarget.value,
                });
            }
        };
        return (
            <div className="flex justify-between items-center" key={index}>
                <label
                    htmlFor={setting.id}
                    className={`basis-1/2 p-2 text-white rounded-md font-medium text-center mr-2`}
                    style={{
                        backgroundColor: `${setting.bgColor})`,
                    }}
                >{`${setting.name}:`}</label>{" "}
                <div className="relative flex">
                    <input
                        className={`outline-none px-2 py-2 w-full text-right rounded-l-sm `}
                        type="text"
                        maxLength={2}
                        style={{
                            backgroundColor: `${setting.bgColor}, 0.1)`,
                        }}
                        value={liveChanges[setting.id].toString()}
                        id={setting.id}
                        onChange={(e) => handleOnChange(e, setting.id)}
                    ></input>
                    <input
                        type="range"
                        min="1"
                        max="95"
                        value={liveChanges[setting.id].toString()}
                        className="absolute w-full h-0.5 left-0 bottom-0"
                        onChange={(e) => handleOnChange(e, setting.id)}
                        step={"1"}
                        style={{ accentColor: `${setting.bgColor})` }}
                    ></input>
                </div>
                <div
                    className={`py-2 rounded-r-sm`}
                    style={{
                        backgroundColor: `${setting.bgColor}, 0.1)`,
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
