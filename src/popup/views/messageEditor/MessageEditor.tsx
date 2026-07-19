import React, { useState, useEffect } from "react";
import { defaultSettings, Settings } from "@src/shared/settings";
import { sendMessageToTab, sendBackgroundImageToTab } from "@src/shared/utils";
import { clearBackgroundImage } from "@src/lib/utilities";
import { ColorControls } from "./components/colorControls";
import { BackgroundControls } from "./components/backgroundControls";
import { MiscControls } from "./components/miscControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { MessageSliderControls } from "./components/messageSliderControls";
import { SelectorHealthCheck } from "@src/components/selectorHealthCheck";

export interface MessageEditorProps {
    liveSettings: Settings;
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

type EditorTab = "messages" | "background" | "misc";

export function MessageEditor({
    liveSettings,
    setLiveSettings,
}: MessageEditorProps): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<EditorTab>("messages");
    const [savedSettings, setSavedSettings] = useState<Settings>({
        ...liveSettings,
    });

    // Keep Cancel's baseline in sync with storage-loaded / saved settings.
    // While editing, leave savedSettings alone so Cancel can restore them.
    useEffect(() => {
        if (!isEditing) {
            setSavedSettings({ ...liveSettings });
        }
    }, [liveSettings, isEditing]);

    // Active tab draws top/side borders and hides the tablist baseline by
    // overlapping it with a surface-colored bottom border (-mb-px).
    const tabButtonClass = (tab: EditorTab): string =>
        `-mb-px px-3 py-1.5 text-sm rounded-t-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            activeTab === tab
                ? "bg-surface text-ink font-semibold border-chrome-edge border-b-surface underline decoration-teal-400 decoration-[1.5px] underline-offset-4"
                : "bg-transparent text-white/70 font-normal border-transparent hover:text-white"
        }`;

    const restoreCurrentTabDefaults = (): void => {
        let nextSettings: Settings;

        if (activeTab === "messages") {
            nextSettings = {
                ...liveSettings,
                messageMaxWidthStyle: defaultSettings.messageMaxWidthStyle,
                messageColorUserStyle: defaultSettings.messageColorUserStyle,
                messageColorNonUserStyle:
                    defaultSettings.messageColorNonUserStyle,
                messagePaddingStyle: defaultSettings.messagePaddingStyle,
                messageBorderRadiusStyle:
                    defaultSettings.messageBorderRadiusStyle,
                inputBoxMaxWidthStyle: defaultSettings.inputBoxMaxWidthStyle,
                textColorUserStyle: defaultSettings.textColorUserStyle,
                textColorNonUserStyle: defaultSettings.textColorNonUserStyle,
            };
        } else if (activeTab === "background") {
            nextSettings = {
                ...liveSettings,
                customBackgroundsEnabled:
                    defaultSettings.customBackgroundsEnabled,
                syncBackgroundColors: defaultSettings.syncBackgroundColors,
                conversationBackgroundStyle:
                    defaultSettings.conversationBackgroundStyle,
                sidebarBackgroundStyle: defaultSettings.sidebarBackgroundStyle,
                syncedBackgroundStyle: defaultSettings.syncedBackgroundStyle,
                backgroundImageEnabled: defaultSettings.backgroundImageEnabled,
                backgroundImageOpacity: defaultSettings.backgroundImageOpacity,
            };
            // The image binary lives in local storage, not Settings, so clear
            // it and drop the injected layer alongside the settings reset.
            clearBackgroundImage();
            sendBackgroundImageToTab(null);
        } else {
            nextSettings = {
                ...liveSettings,
                scrollToTopEnabled: defaultSettings.scrollToTopEnabled,
                themePreference: defaultSettings.themePreference,
            };
        }

        setLiveSettings(nextSettings);
        sendMessageToTab(nextSettings);
        setIsEditing(true);
    };

    return (
        <div
            className={`grid grid-cols-1 gap-y-3 px-3 pt-3 pb-3 select-none ${
                !isEditing ? "animate-fade-in" : ""
            }`}
        >
            <div
                role="tablist"
                aria-label="Settings sections"
                className="grid grid-cols-3 border-b border-chrome-edge -mx-3 -mt-3 px-3 pt-2 bg-brand shadow-chrome"
            >
                <button
                    type="button"
                    role="tab"
                    id="messages-tab"
                    aria-selected={activeTab === "messages"}
                    aria-controls="messages-panel"
                    className={tabButtonClass("messages")}
                    onClick={() => setActiveTab("messages")}
                >
                    Messages
                </button>
                <button
                    type="button"
                    role="tab"
                    id="background-tab"
                    aria-selected={activeTab === "background"}
                    aria-controls="background-panel"
                    className={tabButtonClass("background")}
                    onClick={() => setActiveTab("background")}
                >
                    Background
                </button>
                <button
                    type="button"
                    role="tab"
                    id="misc-tab"
                    aria-selected={activeTab === "misc"}
                    aria-controls="misc-panel"
                    className={tabButtonClass("misc")}
                    onClick={() => setActiveTab("misc")}
                >
                    Misc
                </button>
            </div>

            {activeTab === "messages" ? (
                <div
                    role="tabpanel"
                    id="messages-panel"
                    aria-labelledby="messages-tab"
                    className="grid grid-cols-1 gap-y-3"
                >
                    <MessageSliderControls
                        setLiveSettings={setLiveSettings}
                        liveSettings={liveSettings}
                        setIsEditing={setIsEditing}
                    />
                    <ColorControls
                        setLiveSettings={setLiveSettings}
                        liveSettings={liveSettings}
                        setIsEditing={setIsEditing}
                    />
                </div>
            ) : activeTab === "background" ? (
                <div
                    role="tabpanel"
                    id="background-panel"
                    aria-labelledby="background-tab"
                >
                    <BackgroundControls
                        setLiveSettings={setLiveSettings}
                        liveSettings={liveSettings}
                        setIsEditing={setIsEditing}
                    />
                </div>
            ) : (
                <div role="tabpanel" id="misc-panel" aria-labelledby="misc-tab">
                    <MiscControls
                        setLiveSettings={setLiveSettings}
                        liveSettings={liveSettings}
                        setIsEditing={setIsEditing}
                    />
                </div>
            )}

            <FormButtons
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                liveSettings={liveSettings}
                setLiveSettings={setLiveSettings}
                savedSettings={savedSettings}
                setSavedSettings={setSavedSettings}
                onRestoreDefaults={restoreCurrentTabDefaults}
            />
            {process.env.NODE_ENV === "development" ? (
                <SelectorHealthCheck />
            ) : null}
        </div>
    );
}
