import React, { MouseEventHandler } from "react";
import { HomeButton } from "@src/components/homeButton";
import { executeScript } from "@src/lib";

// // // //

const scrollToTopPosition = 0;
const scrollToBottomPosition = 9999999;

interface HomeMenuProps {
    textEditorRedirect: any;
    messageEditorRedirect: any;
}

// // // //

export function HomeMenu({
    textEditorRedirect,
    messageEditorRedirect,
}: HomeMenuProps): JSX.Element {
    return (
        <div className="grid gap-3 grid-cols-2 mt-3 w-full">
            <HomeButton
                dataTestid="scroll-to-top"
                onClick={() => {
                    executeScript(scrollToTopPosition);
                }}
                btnLabel="Scroll To Top"
            />
            <HomeButton
                dataTestid="scroll-to-botom"
                onClick={() => {
                    executeScript(scrollToBottomPosition);
                }}
                btnLabel="Scroll To Bottom"
            />
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
