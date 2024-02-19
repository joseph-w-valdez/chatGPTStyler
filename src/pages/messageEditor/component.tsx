import React, {useEffect, useState} from "react";
import {getOptionsFromStorage} from "@src/lib/utilities/googleStorage";
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
    setOptions
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
            <button onClick={() => {
                        setPage('');
                    }} >back</button>
            {inputSettings.map(mapInputSettings)}
            <hr />
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
    );
}
