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
    return (
        <div className="grid gap-3 grid-cols-1 mt-3 w-full">
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
        </div>
    );
}
