import { SettingsType } from "@src/lib/utilities/googleStorage";
import React from "react";
import { useState, useEffect } from "react";

export interface MessageFormControlProps {
    settingsOptions: "message" | "text";
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    applyUpdates: (action: string, value: number | string) => void;
}

export function MessageFormControl({
    settingsOptions,
    setLiveChanges,
    liveChanges,
    applyUpdates,
}: MessageFormControlProps): JSX.Element {
    const [colorType, setColorType] = useState<string>("");
    const [inputMaxLength, setInputMaxLength] = useState<number>(30);
    const formatColor = (color: string) => {
        switch (colorType) {
            case "name":
                setInputMaxLength(30);
                return color;
            case "hex":
                setInputMaxLength(6);
                return `#${color}`;
            case "rgb":
                setInputMaxLength(11);
                return `rgb(${color})`;
            case "hsl":
                setInputMaxLength(9);
                return `hsl(${color})`;
            default:
                return color;
        }
    };

    const formatKey = (isUser: boolean): keyof SettingsType => {
        let formattedKey: keyof SettingsType;
        if (isUser) formattedKey = `${settingsOptions}ColorUserStyle`;
        else formattedKey = `${settingsOptions}ColorNonUserStyle`;
        return formattedKey;
    };
    // useEffect(() => {
    //     switch (colorType) {
    //         case "name":
    //             setPlaceholderValue("Color Name");
    //             setInputMaxLength(30);
    //             colorCode && setColorStyle(colorCode);
    //             break;
    //         case "hex":
    //             setPlaceholderValue("HEX");
    //             setInputMaxLength(6);
    //             colorCode.length === 6 && setColorStyle(`#${colorCode}`);
    //             break;
    //         case "rgb":
    //             setPlaceholderValue("R, G, B");
    //             setInputMaxLength(11);
    //             colorCode.length >= 5 && setColorStyle(`rgb(${colorCode})`);
    //             break;
    //         case "hsl":
    //             setPlaceholderValue("HUE, Saturation%, Light%");
    //             setInputMaxLength(9);
    //             colorCode.length >= 7 && setColorStyle(`hsl(${colorCode})`);
    //             break;
    //         default:
    //             setPlaceholderValue("Select Color Type");
    //             setColorType("");
    //             setColorCode("");
    //             setColorStyle("");
    //             setInputMaxLength(0);
    //     }
    //     colorLiveChange(colorStyle);
    // }, [colorType, colorCode, colorStyle]);

    return (
        <div className="flex flex-col justify-center items-center bg-indigo-400 rounded-md p-2 gap-1 font-medium">
            <label
                htmlFor={`${formatKey(true)}ColorType`}
                className=" text-white text-center"
            >
                {`Chat Message ${
                    formatKey(true) === "messageColorUserStyle"
                        ? "Background"
                        : "Text"
                } Color`}
            </label>
            <select
                id={`${formatKey(true)}`}
                className="p-1 rounded-md"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setColorType(e.currentTarget.value)
                }
            >
                <option value="" disabled hidden>
                    Color Type
                </option>
                <option value="">Select</option>
                <option value="name">Name</option>
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
            </select>
            <div className="grid grid-cols-2 gap-x-1">
                <input
                    className={`text-center w-full p-1 rounded-md ${
                        colorType
                            ? "animate-fade-in placeholder:text-black/30"
                            : "animate-fade-out placeholder:text-white/70 "
                    }`}
                    disabled={!colorType}
                    type="text"
                    id={`${formatKey(true)} TextColor`}
                    maxLength={inputMaxLength}
                    value={liveChanges[formatKey(true)]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLiveChanges({
                            ...liveChanges,
                            [formatKey(true)]: formatColor(
                                e.currentTarget.value,
                            ),
                        });
                        applyUpdates(
                            formatKey(true),
                            formatColor(e.currentTarget.value),
                        );
                    }}
                />
                <input
                    className={`text-center w-full p-1 rounded-md ${
                        colorType
                            ? "animate-fade-in placeholder:text-black/30"
                            : "animate-fade-out placeholder:text-white/70 "
                    }`}
                    disabled={!colorType}
                    type="text"
                    id={`${formatKey(false)} TextColor`}
                    maxLength={inputMaxLength}
                    value={liveChanges[formatKey(false)]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLiveChanges({
                            ...liveChanges,
                            [formatKey(false)]: formatColor(
                                e.currentTarget.value,
                            ),
                        });
                        applyUpdates(
                            formatKey(false),
                            formatColor(e.currentTarget.value),
                        );
                    }}
                />
                <span className="text-white rounded-md font-medium text-center p-0 m-0">
                    User
                </span>
                <span className="text-white rounded-md font-medium text-center p-0 m-0">
                    Chat-GPT
                </span>
            </div>
        </div>
    );
}
