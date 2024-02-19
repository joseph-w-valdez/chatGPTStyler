import React from "react";
import { useState, useEffect } from "react";

export interface MessageFormControlProps {
    section: string;
    colorLiveChange: (colorStyle: string) => void;
    option: any;
}

export function MessageFormControl({
    section,
    colorLiveChange,
    option,
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
        <div>
            <h1>{`${section} Message`}</h1>
            <hr />
            <label>
                Message Color
                <select
                    id={`${section}ColorType`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setColorType(e.currentTarget.value)
                    }
                >
                    <option value="" disabled hidden>
                        Color Type
                    </option>
                    <option value="name">Name</option>
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                </select>
                <input
                    disabled={colorType ? false : true}
                    type="text"
                    id={`${section} TextColor`}
                    placeholder={option}
                    maxLength={inputMaxLength}
                    value={colorCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setColorCode(e.currentTarget.value)
                    }
                />
            </label>
        </div>
    );
}
