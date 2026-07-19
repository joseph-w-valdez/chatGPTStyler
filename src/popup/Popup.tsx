import React from "react";
import { useState, useEffect, useRef } from "react";
import css from "./styles.module.css";
import { Header } from "@src/components/header/Header";
import { getOptionsFromStorage } from "@src/lib/utilities/settingsStorage";
import { MessageEditor } from "./views/messageEditor";
import { defaultSettings, Settings } from "@src/shared/settings";
import {
    POPUP_PORT_NAME,
    UpdateSettingsPortMessage,
} from "@src/shared/messaging";

export function Popup(): JSX.Element {
    const [liveSettings, setLiveSettings] = useState<Settings>({
        ...defaultSettings,
    });
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const portRef = useRef<chrome.runtime.Port | null>(null);

    const sendSettingsToBackground = (updatedSettings: Settings) => {
        const port = portRef.current;
        if (!port) return;

        const message: UpdateSettingsPortMessage = {
            type: "updateSettings",
            settings: updatedSettings,
        };

        try {
            port.postMessage(message);
        } catch (error) {
            console.error(error);
        }
    };

    // Only mirror settings to the background after storage has loaded.
    // Avoids saving defaultSettings if the popup closes during the initial race.
    useEffect(() => {
        if (!settingsLoaded) return;
        sendSettingsToBackground(liveSettings);
    }, [liveSettings, settingsLoaded]);

    useEffect(() => {
        const port = chrome.runtime.connect({ name: POPUP_PORT_NAME });
        portRef.current = port;

        getOptionsFromStorage((savedOptions) => {
            setLiveSettings(savedOptions);
            setSettingsLoaded(true);
        });

        return () => {
            port.disconnect();
            portRef.current = null;
        };
    }, []);

    return (
        <div className={css.popupContainer}>
            <div className="w-full">
                <Header />
                <MessageEditor
                    liveSettings={liveSettings}
                    setLiveSettings={setLiveSettings}
                />
            </div>
        </div>
    );
}
