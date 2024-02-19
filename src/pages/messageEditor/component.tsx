import React, { useEffect, useState } from "react";
import { getOptionsFromStorage } from "@src/lib/utilities/googleStorage";
import { MessageFormControl } from "@src/components/messageFormControl";
import { OptionsTypes } from "@src/lib/utilities/googleStorage";
import css from "./styles.module.css";

export interface MessageEditorProps {
    userMessageColorLiveChange: (colorStyle: string) => void;
    chatMessageColorLiveChange: (colorStyle: string) => void;
    messageMaxWidthLiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    messagePaddingLiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    messageBorderRadiusLiveChange: (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => void;
    inputBoxMaxWidthLiveChange: (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => void;
    options: OptionsTypes;
    setPage: (page: string) => void;
    setOptions: (options: OptionsTypes) => void;
}

export function MessageEditor({
    userMessageColorLiveChange,
    chatMessageColorLiveChange,
    messageMaxWidthLiveChange,
    messagePaddingLiveChange,
    messageBorderRadiusLiveChange,
    inputBoxMaxWidthLiveChange,
    options,
    setPage,
    setOptions,
}: MessageEditorProps): JSX.Element {
    class InputSetting {
        name: string = "";
        id: keyof OptionsTypes = "messageMaxWidthStyle";
        valueType: "px" | "%" = "px";
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void = () => {};

        constructor(
            name: string,
            id: keyof OptionsTypes = "messageMaxWidthStyle",
            valueType: "px" | "%" = "px",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        ) {
            this.name = name;
            this.id = id;
            this.valueType = valueType;
            this.onChange = onChange;
        }
    }
    const inputSettings = [
        new InputSetting(
            "Message Width",
            "messageMaxWidthStyle",
            "%",
            messageMaxWidthLiveChange,
        ),
        new InputSetting(
            "Message Padding",
            "messagePaddingStyle",
            "px",
            messagePaddingLiveChange,
        ),
        new InputSetting(
            "Message Border",
            "messageBorderRadiusStyle",
            "px",
            messageBorderRadiusLiveChange,
        ),
        new InputSetting(
            "Input Box Width",
            "inputBoxMaxWidthStyle",
            "%",
            inputBoxMaxWidthLiveChange,
        ),
    ];

    const [savedOption, setSavedOption] = useState<OptionsTypes>(options);

    useEffect(() => {
        getOptionsFromStorage((savedOptions) => {
            setOptions(savedOptions);
            setSavedOption(savedOptions);
        });
    }, []);

    const mapInputSettings = (setting: InputSetting, index: number) => {
        const bgColors = ["#910A67", "#720455", "#3C0753", "#030637"];
        return (
            <div className="flex justify-between items-center" key={index}>
                <label
                    htmlFor={setting.id}
                    className={`bg-settings${
                        index + 1
                    } basis-1/2 p-2 text-white rounded-md font-medium text-center mr-2`}
                >{`${setting.name}:`}</label>{" "}
                <div className="relative flex ">
                    <input
                        className={`bg-${bgColors[index]}]/10 outline-none px-2 py-2 text-right w-full rounded-l-sm`}
                        type="text"
                        id={setting.id}
                        placeholder={options[setting.id]}
                        onChange={setting.onChange}
                    ></input>
                    <input
                        type="range"
                        min="1"
                        max="95"
                        value={options[setting.id]}
                        className="absolute w-full h-0.5 left-0 top-8 accent-gray-500"
                        onChange={setting.onChange}
                        step={"2"}
                    ></input>
                </div>
                <div className={`bg-[${bgColors[index]}]/10 py-2 rounded-r-sm`}>
                    {setting.valueType}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-y-3 animate-fade-in px-3 pb-2">
            {inputSettings.map(mapInputSettings)}
            <div className="grid grid-cols-2 gap-2 place-items-center">
                <MessageFormControl
                    section={"User"}
                    colorLiveChange={userMessageColorLiveChange}
                    option={savedOption.messageColorUserStyle}
                />
                <MessageFormControl
                    section={"Chat"}
                    colorLiveChange={chatMessageColorLiveChange}
                    option={savedOption.messageColorNonUserStyle}
                />
            </div>
        </div>
    );
}
