import React from "react";
import { HomeButton } from "@src/components/homeButton";

interface HomeMenuProps {
    textEditorRedirect: any;
    messageEditorRedirect: any;
}

export function HomeMenu({
    textEditorRedirect,
    messageEditorRedirect,
}: HomeMenuProps): JSX.Element {
    const callFunction = (arg: number) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id || 0, {
                action: "updateMaxWidth",
                arg: arg,
            });
        });
    };

    return (
        <div className="grid gap-3 grid-cols-1 mt-3 w-full px-4">
            <HomeButton
                dataTestid="text-editor"
                onClick={textEditorRedirect}
                btnLabel="Text Editor"
            />
            <HomeButton
                dataTestid="message-editor"
                onClick={messageEditorRedirect}
                btnLabel="Message Editor"
            />
            <HomeButton
                dataTestid="misc-editor"
                onClick={messageEditorRedirect}
                btnLabel="Miscellaneous"
            />
            <HomeButton
                dataTestid="CHANGE MAX WIDTH WITHOUT SAVING TO SETTINGS?"
                onClick={() => callFunction(50)}
                btnLabel="Miscellaneous"
            />
        </div>
    );
}
