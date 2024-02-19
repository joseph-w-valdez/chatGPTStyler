import React from "react";
import { MessageFormControl } from "@src/components/messageFormControl";
import { OptionsTypes } from "@src/lib/utilities/googleStorage";

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
}

export function MessageEditor({
    userMessageColorLiveChange,
    chatMessageColorLiveChange,
    messageMaxWidthLiveChange,
    messagePaddingLiveChange,
    messageBorderRadiusLiveChange,
    inputBoxMaxWidthLiveChange,
    options,
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

    const mapInputSettings = (setting: InputSetting, index: number) => {
        return (
            <div className="flex justify-between" key={index}>
                <label htmlFor={setting.id}>{`${setting.name}:`}</label>{" "}
                <div>
                    <input
                        className="pl-2 text-right"
                        type="text"
                        id={setting.id}
                        placeholder={options[setting.id]}
                        onChange={setting.onChange}
                    ></input>
                    <span className="bg-white">{setting.valueType}</span>
                </div>
            </div>
        );
    };
    return (
        <div className="grid grid-cols-1 gap-4">
            {inputSettings.map(mapInputSettings)}
            <hr />
            <MessageFormControl
                section={"User"}
                colorLiveChange={userMessageColorLiveChange}
            />
            <MessageFormControl
                section={"Chat"}
                colorLiveChange={chatMessageColorLiveChange}
            />
        </div>
    );
}
