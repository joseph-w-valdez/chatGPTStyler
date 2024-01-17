import React from "react";
import { useState, useEffect } from "react";

export interface TextFormControlsProps {
    section: string;
    colorLiveChange: (colorStyle: string) => void;
    fontSizeOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fontWeightOnChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function TextFormControls({
    section,
    colorLiveChange,
    fontSizeOnChange,
    fontWeightOnChange,
}: TextFormControlsProps): JSX.Element {
    const [placeholderValue, setPlaceholderValue] =
        useState<string>("Select Color Type");
    const [colorType, setColorType] = useState<string>("");
    const [colorCode, setColorCode] = useState<string>("");
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

    // // // //
    return (
        <div>
            <h1>{`${section} Text`}</h1>
            <hr />
            <label>
                Text Color:
                <select
                    id={`${section}ColorType`}
                    defaultValue={""}
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
                    id={`${section}TextColor`}
                    placeholder={placeholderValue}
                    maxLength={inputMaxLength}
                    value={colorCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setColorCode(e.currentTarget.value)
                    }
                />
            </label>
            <br />
            <label>
                Font Size:
                <input
                    type="text"
                    id={`${section}FontSize`}
                    placeholder="pixel"
                    onChange={fontSizeOnChange}
                />
            </label>
            <br />
            <label>
                Font Weight:
                <select
                    id={`${section}FontWeight`}
                    defaultValue={""}
                    onChange={fontWeightOnChange}
                >
                    <option value="" disabled hidden>
                        Select a Font Weight
                    </option>
                    <option value="100">Thin</option>
                    <option value="200">Extra Light</option>
                    <option value="300">Light</option>
                    <option value="400">Normal</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                </select>
            </label>
        </div>
    );
}
