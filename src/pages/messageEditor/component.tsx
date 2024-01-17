import React from "react";
import { MessageFormControl } from "@src/components/messageFormControl";

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
}

export function MessageEditor({
    userMessageColorLiveChange,
    chatMessageColorLiveChange,
    messageMaxWidthLiveChange,
    messagePaddingLiveChange,
    messageBorderRadiusLiveChange,
    inputBoxMaxWidthLiveChange,
}: MessageEditorProps): JSX.Element {
    return (
        <div>
            <label>
                Message Width:
                <input
                    type="text"
                    id="messageMaxWidthStyle"
                    placeholder="percentage"
                    onChange={messageMaxWidthLiveChange}
                ></input>
            </label>
            <label>
                Message Padding:
                <input
                    type="text"
                    id="messagePaddingStyle"
                    placeholder="percentage"
                    onChange={messagePaddingLiveChange}
                ></input>
            </label>
            <label>
                Message Border:
                <input
                    type="text"
                    id="messageBorderStyle"
                    placeholder="percentage"
                    onChange={messageBorderRadiusLiveChange}
                ></input>
            </label>
            <label>
                Input Box Width:
                <input
                    type="text"
                    id="inputBoxMaxWidth"
                    placeholder="percentage"
                    onChange={inputBoxMaxWidthLiveChange}
                ></input>
            </label>
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
