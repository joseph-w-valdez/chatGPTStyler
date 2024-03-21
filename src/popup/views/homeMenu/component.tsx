import React from "react";
import { HomeButton } from "@src/components/homeButton/HomeButton";

export interface HomeMenuProps {
    setPage: React.Dispatch<React.SetStateAction<string>>;
}

export function HomeMenu({ setPage }: HomeMenuProps): JSX.Element {
    return (
        <div className="grid gap-3 grid-cols-1 mt-3 w-full px-4">
            <HomeButton
                dataTestid="message-editor"
                onClick={() => setPage("Message Editor")}
                btnLabel="Message Editor"
            />
            <HomeButton
                dataTestid="misc-editor"
                onClick={() => setPage("Miscellaneous")}
                btnLabel="Miscellaneous"
            />
        </div>
    );
}
