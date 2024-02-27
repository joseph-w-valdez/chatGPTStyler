import React from "react";
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";
import { Header } from "@src/components/header/Header";
import {
    SettingsType,
    getOptionsFromStorage,
} from "@src/lib/utilities/googleStorage";
import { MessageEditor } from "./views/messageEditor";
import { HomeMenu } from "./views/homeMenu";
import { defaultSettings } from "@src/shared/utils/data";
import { loadSettings } from "@src/shared/utils";
import { MiscEditor } from "./views/miscEditor/component";

const port = browser.runtime.connect({ name: "popup" });

export function Popup(): JSX.Element {
    const [settings, setSettings] = useState<SettingsType>({
        ...defaultSettings,
    });
    const [page, setPage] = useState<string>("Home");

    useEffect(() => {
        port.postMessage({ popupOpened: true });
    
        port.onMessage.addListener((message) => {
            if (message.action === "updateSettings") {
                setSettings(message.settings);
            }
        });
    
        // Clean up when the popup is closed
        return () => {
            port.disconnect();
        };
    }, []);

    const sendSettingsToBackground = (updatedSettings: SettingsType) => {
        port.postMessage({ type: 'updateSettings', settings: updatedSettings });
    };
    
    useEffect(() => {
        sendSettingsToBackground(settings);
        console.log("sending settings to background", settings);
    }, [settings]);

    useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
        getOptionsFromStorage((savedOptions) => {
            setSettings(savedOptions);
            loadSettings(savedOptions);
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
                ) : page === "Miscellaneous" ? (
                    <MiscEditor settings={settings} setSettings={setSettings} />
                ) : (
                    <HomeMenu setPage={setPage} />
                )}
            </div>
        </div>
    );
}
