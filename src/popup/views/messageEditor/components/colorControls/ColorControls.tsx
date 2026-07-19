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

        return (
            <fieldset
                key={index}
                className="flex flex-col justify-center items-center bg-surface-elevated border border-edge rounded-lg p-3 gap-2 font-medium w-full m-0 min-w-0"
            >
                <legend className="sr-only">{`${userType} color settings`}</legend>
                <div
                    className="text-center text-sm px-2 py-1.5 w-full rounded-md border border-edge"
                    aria-hidden="true"
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
                </div>
                <div className="grid grid-cols-2 gap-2 w-full text-ink-muted text-xs">
                    {colorSettings.map((setting, settingIndex) =>
                        mapSettingInputs(
                            setting,
                            settingIndex,
                            isUser,
                            userType,
                        ),
                    )}
                    <span className="text-center font-medium p-0 m-0">BG</span>
                    <span className="text-center font-medium p-0 m-0">
                        Text
                    </span>
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
            <input
                key={index}
                className="text-center w-full rounded-md h-8 border border-edge bg-surface cursor-pointer"
                type="color"
                id={settingsKey}
                aria-label={`${userType} ${channelLabel} color`}
                value={liveSettings[settingsKey]}
                onChange={(e) => handleOnChange(e, settingsKey)}
            />
        );
    };

    return (
        <div className="grid grid-cols-2 gap-2 place-items-center w-full">
            {["User", "ChatGPT"].map(mapColorSettings)}
        </div>
    );
}
