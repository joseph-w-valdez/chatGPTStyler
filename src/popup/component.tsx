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
    const [liveSettings, setLiveSettings] = useState<SettingsType>({
        ...defaultSettings,
    });
    const [page, setPage] = useState<string>("Home");

    const sendSettingsToBackground = (updatedSettings: SettingsType) => {
        try {
            console.log("sending settings to background", liveSettings);
            port.postMessage({
                type: "updateSettings",
                settings: updatedSettings,
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        sendSettingsToBackground(liveSettings);
    }, [liveSettings]);

    useEffect(() => {
        port.postMessage({ popupOpened: true });
        browser.runtime.sendMessage({ popupMounted: true });
        getOptionsFromStorage((savedOptions) => {
            setLiveSettings(savedOptions);
            loadSettings(savedOptions);
            console.log("loaded options from storage", savedOptions);
        });
        return () => {
            port.disconnect();
        };
    }, []);

    // Renders the component tree
    return (
            <div className={css.popupContainer}>
            <div className="w-full">
                <Header page={page} setPage={setPage} />
                <hr className="mb-2" />
                <MessageEditor
                    liveSettings={liveSettings}
                    setLiveSettings={setLiveSettings}
                />
            </div>
        </div>
    );
}
