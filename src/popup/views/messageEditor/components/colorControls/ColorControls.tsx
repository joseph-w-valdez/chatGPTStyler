import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface ColorControlsProps {
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    liveSettings: Settings;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export type ColorSetting = "messageColor" | "textColor";

export function ColorControls({
    setLiveSettings,
    liveSettings,
    setIsEditing,
}: ColorControlsProps): JSX.Element {
    const colorSettings: ColorSetting[] = ["messageColor", "textColor"];

    const mapColorSettings = (userType: string, index: number) => {
        const isUser = userType === "User";
        const legendId = `${isUser ? "user" : "chatgpt"}-color-legend`;

        return (
            <fieldset
                key={index}
                className="flex flex-col justify-center items-center bg-violet-500 rounded-md p-3 gap-1 font-medium w-full border-0 m-0 min-w-0"
            >
                <legend
                    id={legendId}
                    className=" text-center p-1 w-24 rounded-md"
                    style={{
                        backgroundColor:
                            liveSettings[
                                `${
                                    isUser
                                        ? "messageColorUserStyle"
                                        : "messageColorNonUserStyle"
                                }`
                            ],
                        color: liveSettings[
                            `${
                                isUser
                                    ? "textColorUserStyle"
                                    : "textColorNonUserStyle"
                            }`
                        ],
                    }}
                >
                    {`${userType} Color`}
                </legend>
                <div
                    className="grid grid-cols-2 gap-1 w-full text-white"
                    role="group"
                    aria-labelledby={legendId}
                >
                    {colorSettings.map((setting, settingIndex) =>
                        mapSettingInputs(
                            setting,
                            settingIndex,
                            isUser,
                            userType,
                        ),
                    )}
                </div>
            </fieldset>
        );
    };

    const mapSettingInputs = (
        setting: ColorSetting,
        index: number,
        isUser: boolean,
        userType: string,
    ) => {
        const settingsKey: keyof Settings = `${setting}${
            isUser ? "User" : "NonUser"
        }Style`;
        const channelLabel = setting === "messageColor" ? "background" : "text";
        const labelText = setting === "messageColor" ? "BG" : "Text";

        const handleOnChange = (
            e: React.ChangeEvent<HTMLInputElement>,
            settingsKey: keyof Settings,
        ) => {
            const nextSettings = {
                ...liveSettings,
                [settingsKey]: e.currentTarget.value,
            };
            setLiveSettings(nextSettings);
            sendMessageToTab(nextSettings);
            setIsEditing(true);
        };

        return (
            <div key={index} className="flex flex-col gap-1 w-full">
                <label
                    htmlFor={settingsKey}
                    className="rounded-md font-medium text-center p-0 m-0"
                >
                    {labelText}
                </label>
                <input
                    className="text-center w-full rounded-md h-8"
                    type="color"
                    id={settingsKey}
                    aria-label={`${userType} ${channelLabel} color`}
                    value={liveSettings[settingsKey]}
                    onChange={(e) => handleOnChange(e, settingsKey)}
                />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-2 gap-2 place-items-center w-full">
            {["User", "ChatGPT"].map(mapColorSettings)}
        </div>
    );
}
