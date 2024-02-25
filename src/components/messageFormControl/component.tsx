import { SettingsType } from "@src/lib/utilities/googleStorage";
import React from "react";
import { useState } from "react";

export interface MessageFormControlProps {
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    sendMessageToRuntime: (
        action: keyof SettingsType | "restoreSettings",
        value?: string | SettingsType,
    ) => void;
}
export type colorSetting = "messageColor" | "textColor";

export function MessageFormControl({
    setLiveChanges,
    liveChanges,
    sendMessageToRuntime,
}: MessageFormControlProps): JSX.Element {
    const [colorType, setColorType] = useState<string>("");
    const [inputMaxLength, setInputMaxLength] = useState<number>(30);
    const colorSettings: colorSetting[] = ["messageColor", "textColor"];

    const formatColor = (color: string) => {
        switch (colorType) {
            case "name":
                return color;
            case "hex":
                return `#${color}`;
            case "rgb":
                return `rgb(${color})`;
            case "hsl":
                return `hsl(${color})`;
            default:
                return color;
        }
    };
    const getMaxLength = () => {
        switch (colorType) {
            case "name":
                return 30;
            case "hex":
                return 6;
            case "rgb":
                return 11;
            case "hsl":
                return 9;
            default:
                return 30;
        }
    };
    // creates color controls. we are making one for user and chat gpt.
    const mapColorSettings = (userType: string, index: number) => {
        const isUser = userType === "User";
        return (
            <div
                key={index}
                className="flex flex-col justify-center items-center bg-indigo-400 rounded-md p-2 gap-1 font-medium"
            >
                <label
                    htmlFor={`${userType}ColorType`}
                    className=" text-white w-full text-center"
                >
                    {`Chat Message ${userType} Color`}
                </label>
                <select
                    id={`${userType}`}
                    className="p-1 rounded-md text-center"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setColorType(e.currentTarget.value)
                    }
                    value={colorType}
                >
                    <option value="">Select</option>
                    <option value="name">Name</option>
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                </select>
                <div className="grid grid-cols-2 gap-x-1">
                    {colorSettings.map((setting, index) =>
                        mapSettingInputs(setting, index, isUser),
                    )}
                    <span className="text-white rounded-md font-medium text-center p-0 m-0">
                        BG
                    </span>
                    <span className="text-white rounded-md font-medium text-center p-0 m-0">
                        Text
                    </span>
                </div>
            </div>
        );
    };
    // creates input elements for color controls. we currently have text color, and bg color
    const mapSettingInputs = (
        setting: colorSetting,
        index: number,
        isUser: boolean,
    ) => {
        const settingsKey: keyof SettingsType = `${setting}${
            isUser ? "User" : "NonUser"
        }Style`;
        return (
            <input
                key={index}
                className={`text-center w-full p-1 rounded-md ${
                    colorType
                        ? "animate-fade-in placeholder:text-black/30"
                        : "animate-fade-out placeholder:text-white/70 "
                }`}
                disabled={!colorType}
                type="text"
                id={`${settingsKey}`}
                maxLength={getMaxLength()}
                placeholder={liveChanges[settingsKey]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setLiveChanges({
                        ...liveChanges,
                        [settingsKey]: formatColor(e.currentTarget.value),
                    });
                    sendMessageToRuntime(
                        settingsKey,
                        formatColor(e.currentTarget.value),
                    );
                }}
            />
        );
    };

    return (
        <div className="grid grid-cols-2 gap-2 place-items-center">
            {["User", "Chat-GPT"].map(mapColorSettings)}
        </div>
    );
}
