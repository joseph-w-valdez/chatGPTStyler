import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface MessageSliderControlsProps {
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    liveSettings: Settings;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MessageSliderControls({
    setLiveSettings,
    liveSettings,
    setIsEditing,
}: MessageSliderControlsProps): JSX.Element {
    // using this to create data we need so we can map through and have clean callback
    class InputSetting {
        name = "";
        id: keyof Settings = "messageMaxWidthStyle";
        valueType: "px" | "%" = "px";
        bgColor = "";

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
            settingKey: keyof Settings,
        ) => {
            const regex = /^\d+$/;
            if (regex.test(e.target.value)) {
                let currValue = e.target.value;
                if (Number(currValue) > 100) currValue = "100";
                const nextSettings = {
                    ...liveSettings,
                    [settingKey]: currValue,
                };
                setIsEditing(true);
                setLiveSettings(nextSettings);
                sendMessageToTab(nextSettings);
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
                        maxLength={3}
                        style={{
                            backgroundColor: `${setting.bgColor}, 0.1)`,
                        }}
                        value={liveSettings[setting.id].toString()}
                        id={setting.id}
                        onChange={(e) => handleOnChange(e, setting.id)}
                    ></input>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={liveSettings[setting.id].toString()}
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
