import React from "react";
import { useState, useEffect } from "react";

export interface MessageFormControlProps {
    section: string;
    colorLiveChange: (colorStyle: string) => void;
    option: any;
    applyUpdates: (action: string, value: number | string) => void;
}

export function MessageFormControl({
    section,
    colorLiveChange,
    option,
    applyUpdates,
}: MessageFormControlProps): JSX.Element {
    const [placeholderValue, setPlaceholderValue] = useState<string>("");
    const [colorType, setColorType] = useState<string>("");
    const [colorCode, setColorCode] = useState<string>(option);
    const [colorStyle, setColorStyle] = useState<string>("");
    const [inputMaxLength, setInputMaxLength] = useState<number>();

    useEffect(() => {
        switch (colorType) {
            case "name":
                setPlaceholderValue("Color Name");
                setInputMaxLength(30);
                colorCode && setColorStyle(colorCode);
                break;
            case "hex":
                setPlaceholderValue("HEX");
                setInputMaxLength(6);
                colorCode.length === 6 && setColorStyle(`#${colorCode}`);
                break;
            case "rgb":
                setPlaceholderValue("R, G, B");
                setInputMaxLength(11);
                colorCode.length >= 5 && setColorStyle(`rgb(${colorCode})`);
                break;
            case "hsl":
                setPlaceholderValue("HUE, Saturation%, Light%");
                setInputMaxLength(9);
                colorCode.length >= 7 && setColorStyle(`hsl(${colorCode})`);
                break;
            default:
                setPlaceholderValue("Select Color Type");
                setColorType("");
                setColorCode("");
                setColorStyle("");
                setInputMaxLength(0);
        }
        colorLiveChange(colorStyle);
    }, [colorType, colorCode, colorStyle]);

    return (
        <div className="flex flex-col justify-center items-center bg-indigo-400 rounded-md p-2 gap-1 font-medium">
            <label
                htmlFor={`${section}ColorType`}
                className=" text-white text-center"
            >
                {section} Message Background Color
            </label>
            <select
                id={`${section}ColorType`}
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
            <input
                className={`text-center w-9/12 p-1 rounded-md ${
                    colorType
                        ? "animate-fade-in placeholder:text-black/30"
                        : "animate-fade-out placeholder:text-white/70 "
                }`}
                disabled={!colorType}
                type="text"
                id={`${section} TextColor`}
                placeholder={option}
                defaultValue={option}
                maxLength={inputMaxLength}
                value={colorCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setColorCode(e.currentTarget.value);
                    applyUpdates(section, e.currentTarget.value);
                }}
            />
        </div>
    );
}
