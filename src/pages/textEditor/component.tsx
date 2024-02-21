import React, { useEffect } from "react";
import { useState } from "react";
import { TextFormControls } from "@src/components/textFormControls";
import {
    OptionsTypes,
    getOptionsFromStorage,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import css from "./styles.module.css";

interface TextEditorProps {
    userColorLiveChange: (colorStyle: string) => void;
    userFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    chatColorLiveChange: (colorStyle: string) => void;
    chatFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    chatFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: OptionsTypes;
    setOptions: (options: OptionsTypes) => void;
}

export function TextEditor({
    userColorLiveChange,
    userFontSizeOnChange,
    userFontWeightOnChange,
    chatColorLiveChange,
    chatFontSizeOnChange,
    chatFontWeightOnChange,
    options,
    setOptions,
}: TextEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [savedOption, setSavedOption] = useState<OptionsTypes>(options);

    useEffect(() => {
        getOptionsFromStorage((savedOptions) => {
            setOptions(savedOptions);
            setSavedOption(savedOptions);
            console.log(savedOption);
        });
    }, []);

    const applyUpdates = (action: string, value: number | string) => {
        setIsEditing(true);
        console.log("action", action);
        console.log("value", value);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: action,
                arg: value,
            });
        });
    };
    return (
        <div className="grid grid-cols-1 gap-4">
            <TextFormControls
                section={"User"}
                colorLiveChange={userColorLiveChange}
                fontSizeOnChange={userFontSizeOnChange}
                fontWeightOnChange={userFontWeightOnChange}
                option={savedOption.textColorUserStyle}
                applyUpdates={applyUpdates}
            />
            <TextFormControls
                section={"Chat"}
                colorLiveChange={chatColorLiveChange}
                fontSizeOnChange={chatFontSizeOnChange}
                fontWeightOnChange={chatFontWeightOnChange}
                option={savedOption.textColorNonUserStyle}
                applyUpdates={applyUpdates}
            />
            <div className="grid grid-cols-4 gap-1">
                <button
                    className={`${css.btn} col-span-2`}
                    onClick={() => {
                        saveOptionsToStorage(options);
                        setIsEditing(false);
                    }}
                >
                    Restore Default
                </button>
                <button
                    disabled={!isEditing}
                    className={`${css.btn}`}
                    onClick={() => {
                        saveOptionsToStorage(options);
                        setSavedOption({ ...options });
                        setIsEditing(false);
                    }}
                >
                    Save
                </button>
                <button
                    disabled={!isEditing}
                    className={`${css.btnRed}`}
                    onClick={() => {
                        setOptions({ ...savedOption });
                        applyUpdates("restoreUserSettings", "");
                        setIsEditing(false);
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
