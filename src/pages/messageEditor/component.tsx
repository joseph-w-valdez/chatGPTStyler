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
    const callFunction = (action: string, value: number) => {
        console.log("action", action);
        console.log("value", value);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: action,
                arg: value,
            });
        });
    };
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
        const bgColors = [
            "rgba(145, 10, 103",
            "rgba(114, 4, 85",
            "rgba(60, 7, 83",
            "rgba(3, 6, 55",
        ];
        console.log("hjgj", setting.id);
        return (
            <div className="flex justify-between items-center" key={index}>
                <label
                    htmlFor={setting.id}
                    className={`basis-1/2 p-2 text-white rounded-md font-medium text-center mr-2`}
                    style={{
                        backgroundColor: `${bgColors[index]})`,
                    }}
                >{`${setting.name}:`}</label>{" "}
                <div className="relative flex ">
                    <input
                        className={`outline-none px-2 py-2 text-right w-full rounded-l-sm`}
                        type="text"
                        style={{
                            backgroundColor: `${bgColors[index]}, 0.1)`,
                        }}
                        id={setting.id}
                        placeholder={options[setting.id]}
                        onChange={setting.onChange}
                    ></input>
                    <input
                        type="range"
                        min="1"
                        max="95"
                        // value={options[setting.id]}
                        defaultValue={options[setting.id]}
                        className="absolute w-full h-0.5 left-0 top-8 accent-gray-500"
                        onChange={(e) =>
                            callFunction(
                                setting.id,
                                Number(e.currentTarget.value),
                            )
                        }
                        step={"1"}
                    ></input>
                    {/* <input
                        type="range"
                        min="1"
                        max="95"
                        value={options[setting.id]}
                        className="absolute w-full h-0.5 left-0 top-8 accent-gray-500"
                        onChange={setting.onChange}
                        step={"3"}
                    ></input> */}
                </div>
                <div
                    className={`py-2 rounded-r-sm`}
                    style={{
                        backgroundColor: `${bgColors[index]}, 0.1)`,
                    }}
                >
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
