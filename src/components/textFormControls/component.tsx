import { SettingsType } from "@src/lib/utilities/googleStorage";
import React from "react";
import { useState, useEffect } from "react";

export interface TextFormControlsProps {
    settingsOptions: "Weight" | "Size";
    setLiveChanges: React.Dispatch<React.SetStateAction<SettingsType>>;
    liveChanges: SettingsType;
    applyUpdates: (action: string, value: number | string) => void;
}

export function TextFormControls({
    settingsOptions,
    liveChanges,
    setLiveChanges,
    applyUpdates,
}: TextFormControlsProps): JSX.Element {
    const [placeholderValue, setPlaceholderValue] =
        useState<string>("Select Color Type");
    const [colorType, setColorType] = useState<string>("");
    const [colorCode, setColorCode] = useState<string>("");
    const [colorStyle, setColorStyle] = useState<string>("");
    const [inputMaxLength, setInputMaxLength] = useState<number>(10);

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

    const formatKey = (isUser: boolean): keyof SettingsType => {
        let formattedKey: keyof SettingsType;
        if (isUser) formattedKey = `text${settingsOptions}UserStyle`;
        else formattedKey = `text${settingsOptions}NonUserStyle`;
        return formattedKey;
    };
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
    return (
        <div className="mx-3 px-3 py-4 bg-pink-900 rounded-lg text-white">
            <h1 className="text-sm font-semibold">{`${settingsOptions} Text`}</h1>
            <hr />
            <div className="text-xs">
                <label>
                    Text Color:
                    <select
                        id={`${settingsOptions}ColorType`}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setColorType(e.currentTarget.value)
                        }
                    >
                        <option value="" disabled hidden>
                            Select
                        </option>
                        <option value="name">Name</option>
                        <option value="hex">HEX</option>
                        <option value="rgb">RGB</option>
                        <option value="hsl">HSL</option>
                    </select>
                    <input
                        disabled={!colorType}
                        type="text"
                        id={`${formatKey(true)} TextColor`}
                        maxLength={inputMaxLength}
                        value={liveChanges[formatKey(true)]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setColorCode(e.currentTarget.value);
                            applyUpdates(
                                settingsOptions,
                                e.currentTarget.value,
                            );
                        }}
                    />
                </label>
                <br />
                <label>
                    Font Size:
                    <input
                        type="text"
                        id={`${settingsOptions}FontSize`}
                        placeholder="pixel"
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
                </label>
                <br />
                <label>
                    Font Weight:
                    <select
                        id={`${settingsOptions}FontWeight`}
                        defaultValue={""}
                        onChange={() => setLiveChanges((prev) => prev)}
                    >
                        <option value="" disabled hidden>
                            Weight
                        </option>
                        <option value="400">Normal</option>
                        <option value="500">Medium</option>
                        <option value="700">Bold</option>
                    </select>
                </label>
            </div>
        </div>
    );
}
