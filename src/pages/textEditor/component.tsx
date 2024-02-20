import React from "react";
import { TextFormControls } from "@src/components/textFormControls";

interface TextEditorProps {
    userColorLiveChange: (colorStyle: string) => void;
    userFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    chatColorLiveChange: (colorStyle: string) => void;
    chatFontSizeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    chatFontWeightOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function TextEditor({
    userColorLiveChange,
    userFontSizeOnChange,
    userFontWeightOnChange,
    chatColorLiveChange,
    chatFontSizeOnChange,
    chatFontWeightOnChange,
}: TextEditorProps): JSX.Element {
    return (
        <div className="grid grid-cols-1 gap-4">
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
