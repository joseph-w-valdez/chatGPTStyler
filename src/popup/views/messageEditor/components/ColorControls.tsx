import { SettingsType } from "@src/lib/utilities/googleStorage";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface ColorControlsProps {
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}
export type colorSetting = "messageColor" | "textColor";

export function ColorControls({
    setLiveChanges,
    liveChanges,
    setIsEditing,
}: ColorControlsProps): JSX.Element {
    const colorSettings: colorSetting[] = ["messageColor", "textColor"];

    // creates color controls. we are making one for user and chat gpt.
    const mapColorSettings = (userType: string, index: number) => {
        const isUser = userType === "User";
        return (
            <div
                key={index}
                className="flex flex-col justify-center items-center bg-violet-500 rounded-md p-3 gap-1 font-medium w-full"
            >
                <span
                    className=" text-center p-1 w-24 rounded-md"
                    style={{
                        backgroundColor:
                            liveChanges[
                                `${
                                    isUser
                                        ? "messageColorUserStyle"
                                        : "messageColorNonUserStyle"
                                }`
                            ],
                        color: liveChanges[
                            `${
                                isUser
                                    ? "textColorUserStyle"
                                    : "textColorNonUserStyle"
                            }`
                        ],
                    }}
                >
                    {`${userType} Color`}
                </span>
                <div className="grid grid-cols-2 gap-1 w-full text-white">
                    {colorSettings.map((setting, index) =>
                        mapSettingInputs(setting, index, isUser),
                    )}
                    <span className="rounded-md font-medium text-center p-0 m-0">
                        BG
                    </span>
                    <span className="rounded-md font-medium text-center p-0 m-0">
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

        const handleOnChange = (
            e: React.ChangeEvent<HTMLInputElement>,
            settingsKey: keyof SettingsType,
        ) => {
            setLiveChanges({
                ...liveChanges,
                [settingsKey]: e.currentTarget.value,
            });
            sendMessageToTab(settingsKey, e.currentTarget.value);
            setIsEditing(true);
        };
        return (
            <input
                key={index}
                className={`text-center w-full rounded-md h-8`}
                type="color"
                id={`${settingsKey}`}
                value={liveChanges[settingsKey]}
                onChange={(e) => handleOnChange(e, settingsKey)}
            />
        );
    };

    return (
        <div className="grid grid-cols-2 gap-2 place-items-center w-full">
            {["User", "Chat-GPT"].map(mapColorSettings)}
        </div>
    );
}
