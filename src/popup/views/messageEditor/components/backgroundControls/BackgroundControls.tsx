import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface BackgroundControlsProps {
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    liveSettings: Settings;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export function BackgroundControls({
    setLiveSettings,
    liveSettings,
    setIsEditing,
}: BackgroundControlsProps): JSX.Element {
    const applySettings = (nextSettings: Settings): void => {
        setLiveSettings(nextSettings);
        sendMessageToTab(nextSettings);
        setIsEditing(true);
    };

    const handleToggle = (key: keyof Settings, checked: boolean): void => {
        applySettings({
            ...liveSettings,
            [key]: checked,
        });
    };

    const handleColorChange = (
        key:
            | "conversationBackgroundStyle"
            | "sidebarBackgroundStyle"
            | "syncedBackgroundStyle",
        value: string,
    ): void => {
        applySettings({
            ...liveSettings,
            [key]: value,
        });
    };

    const renderSurfaceCard = (
        label: string,
        settingsKey:
            | "conversationBackgroundStyle"
            | "sidebarBackgroundStyle"
            | "syncedBackgroundStyle",
    ): JSX.Element => {
        const value = liveSettings[settingsKey];

        return (
            <fieldset className="flex flex-col justify-center items-center bg-surface-raised border border-edge rounded-lg p-3 gap-2 font-medium m-0 min-w-0 w-full">
                <legend className="sr-only">{`${label} background color`}</legend>
                <div
                    className="text-center text-sm px-2 py-1.5 w-full rounded-md border border-edge text-ink"
                    aria-hidden="true"
                    style={{ backgroundColor: value }}
                >
                    {label}
                </div>
                <input
                    className="text-center w-full rounded-md h-8 border border-edge bg-surface cursor-pointer"
                    type="color"
                    id={settingsKey}
                    aria-label={`${label} background color`}
                    value={value}
                    onChange={(e) =>
                        handleColorChange(settingsKey, e.currentTarget.value)
                    }
                />
            </fieldset>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-y-3 w-full">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="rounded border-edge"
                    checked={liveSettings.customBackgroundsEnabled}
                    onChange={(e) =>
                        handleToggle(
                            "customBackgroundsEnabled",
                            e.currentTarget.checked,
                        )
                    }
                />
                Customize backgrounds
            </label>

            {liveSettings.customBackgroundsEnabled ? (
                <>
                    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="rounded border-edge"
                            checked={liveSettings.syncBackgroundColors}
                            onChange={(e) =>
                                handleToggle(
                                    "syncBackgroundColors",
                                    e.currentTarget.checked,
                                )
                            }
                        />
                        Sync colors
                    </label>

                    {liveSettings.syncBackgroundColors ? (
                        renderSurfaceCard(
                            "App Background",
                            "syncedBackgroundStyle",
                        )
                    ) : (
                        <div className="grid grid-cols-2 gap-2 place-items-center w-full">
                            {renderSurfaceCard(
                                "Conversation",
                                "conversationBackgroundStyle",
                            )}
                            {renderSurfaceCard(
                                "Sidebar",
                                "sidebarBackgroundStyle",
                            )}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}
