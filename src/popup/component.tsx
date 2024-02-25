import React from "react";
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";
import { Header } from "@src/components/header/Header";
import {
    SettingsType,
    getOptionsFromStorage,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import { MessageEditor } from "@src/pages/messageEditor";
import { HomeMenu } from "@src/pages/homeMenu";
import { defaultSettings } from "@src/shared/utils/data";

export function Popup(): JSX.Element {
    const [settings, setSettings] = useState<SettingsType>({
        ...defaultSettings,
    });

    const [page, setPage] = useState<string>("Home Menu");
    // Sends the `popupMounted` event
    useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    // Load options from storage when the popup is opened
    useEffect(() => {
        getOptionsFromStorage((savedOptions) => {
            setSettings(savedOptions);
            console.log("loaded options from storage", savedOptions);
        });
    }, []);

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="w-full">
                <Header page={page} setPage={setPage} />
                <hr className="mb-2" />
                {page === "Message Editor" ? (
                    <MessageEditor
                        settings={settings}
                        setSettings={setSettings}
                    />
                ) : (
                    <HomeMenu setPage={setPage} />
                )}
            </div>
        </div>
    );
}
