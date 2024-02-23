import React from "react";
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";
import { Header } from "@src/components/header";
import { RenderPage } from "@src/lib/utilities/RenderPage";
import {
    SettingsType,
    getOptionsFromStorage,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";
import { MessageEditor } from "@src/pages/messageEditor";
import { TextEditor } from "@src/pages/textEditor";
import { HomeMenu } from "@src/pages/homeMenu";

export function Popup(): JSX.Element {
    const [settings, setSettings] = useState<SettingsType>({
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messageMaxWidthStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        textSizeUserStyle: "",
        textSizeNonUserStyle: "",
        textWeightUserStyle: "",
        textWeightNonUserStyle: "",
    });

    const updateLiveValues = (
        setting: keyof SettingsType,
        value: number | string,
    ) => {
        setSettings({ ...settings, [setting]: value });
    };

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

    // Use useEffect to save options whenever they change

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
                ) : page === "Text Editor" ? (
                    <TextEditor settings={settings} setOptions={setSettings} />
                ) : (
                    <HomeMenu setPage={setPage} />
                )}
            </div>
        </div>
    );
}
