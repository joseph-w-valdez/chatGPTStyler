import React from "react";
import { useState, useEffect, useRef } from "react";
import css from "./styles.module.css";
import { Header } from "@src/components/header/Header";
import {
    SettingsType,
    getOptionsFromStorage,
} from "@src/lib/utilities/googleStorage";
import { MessageEditor } from "./views/messageEditor";
import { defaultSettings } from "@src/shared/utils/data";
import {
    POPUP_PORT_NAME,
    UpdateSettingsPortMessage,
} from "@src/shared/messaging";

export function Popup(): JSX.Element {
    const [liveSettings, setLiveSettings] = useState<SettingsType>({
        ...defaultSettings,
    });
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const portRef = useRef<chrome.runtime.Port | null>(null);

    const sendSettingsToBackground = (updatedSettings: SettingsType) => {
        const port = portRef.current;
        if (!port) return;

        const message: UpdateSettingsPortMessage = {
            type: "updateSettings",
            settings: updatedSettings,
        };

        try {
            console.log("sending settings to background", updatedSettings);
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
            console.log("loaded options from storage", savedOptions);
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
                <hr className="mb-2" />
                <MessageEditor
                    liveSettings={liveSettings}
                    setLiveSettings={setLiveSettings}
                />
            </div>
        </div>
    );
}
