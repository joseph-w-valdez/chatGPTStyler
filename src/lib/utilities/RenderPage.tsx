import React from "react";
import { useState } from "react";
import { HomeMenu } from "@src/pages/homeMenu";
import { TextEditor } from "@src/pages/textEditor/component";
import { MessageEditor } from "@src/pages/messageEditor";

interface RenderPageProps {
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
    userColorLiveChange: (colorStyle: string) => void;
    userFontSizeOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    userFontWeightOnChange: (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => void;
    chatColorLiveChange: (colorStyle: string) => void;
    chatFontSizeOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    chatFontWeightOnChange: (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => void;
}

export function RenderPage({
    userMessageColorLiveChange,
    chatMessageColorLiveChange,
    messageMaxWidthLiveChange,
    messagePaddingLiveChange,
    messageBorderRadiusLiveChange,
    inputBoxMaxWidthLiveChange,
    userColorLiveChange,
    userFontSizeOnChange,
    userFontWeightOnChange,
    chatColorLiveChange,
    chatFontSizeOnChange,
    chatFontWeightOnChange,
}: RenderPageProps): JSX.Element {
    const [page, setPage] = useState<string>("Home Page");

    switch (page) {
        case "Text Editor":
            return (
                <TextEditor
                    userColorLiveChange={userColorLiveChange}
                    userFontSizeOnChange={userFontSizeOnChange}
                    userFontWeightOnChange={userFontWeightOnChange}
                    chatColorLiveChange={chatColorLiveChange}
                    chatFontSizeOnChange={chatFontSizeOnChange}
                    chatFontWeightOnChange={chatFontWeightOnChange}
                />
            );
        case "Message Editor":
            return (
                <MessageEditor
                    userMessageColorLiveChange={userMessageColorLiveChange}
                    chatMessageColorLiveChange={chatMessageColorLiveChange}
                    messageMaxWidthLiveChange={messageMaxWidthLiveChange}
                    messagePaddingLiveChange={messagePaddingLiveChange}
                    messageBorderRadiusLiveChange={
                        messageBorderRadiusLiveChange
                    }
                    inputBoxMaxWidthLiveChange={inputBoxMaxWidthLiveChange}
                />
            );
        default:
            return (
                <HomeMenu
                    messageEditorRedirect={() => {
                        setPage("Message Editor");
                    }}
                    textEditorRedirect={() => {
                        setPage("Text Editor");
                    }}
                />
            );
    }
}
