import React from "react";
import { TextFormControls } from "@src/components/textFormControls";

interface TextEditorProps {
    userColorLiveChange: (colorStyle: string) => void;
    userFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    chatColorLiveChange: (colorStyle: string) => void;
    chatFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    chatFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    setPage: React.Dispatch<React.SetStateAction<string>>;
}

export function TextEditor({
    userColorLiveChange,
    userFontSizeOnChange,
    userFontWeightOnChange,
    chatColorLiveChange,
    chatFontSizeOnChange,
    chatFontWeightOnChange,
    setPage,
}: TextEditorProps): JSX.Element {
    return (
        <div className="grid grid-cols-1 gap-4">
            <button
                onClick={() => {
                    setPage("");
                }}
            >
                back
            </button>
            <TextFormControls
                section={"User"}
                colorLiveChange={userColorLiveChange}
                fontSizeOnChange={userFontSizeOnChange}
                fontWeightOnChange={userFontWeightOnChange}
            />
            <TextFormControls
                section={"Chat"}
                colorLiveChange={chatColorLiveChange}
                fontSizeOnChange={chatFontSizeOnChange}
                fontWeightOnChange={chatFontWeightOnChange}
            />
        </div>
    );
}
