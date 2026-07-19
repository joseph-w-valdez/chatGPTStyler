import { Settings } from "@src/shared/settings";
import { sendMessageToTab, sendBackgroundImageToTab } from "@src/shared/utils";
import {
    getBackgroundImage,
    saveBackgroundImage,
    clearBackgroundImage,
} from "@src/lib/utilities";
import {
    ACCEPTED_BACKGROUND_IMAGE_ACCEPT,
    ACCEPTED_BACKGROUND_IMAGE_TYPES,
    MAX_BACKGROUND_IMAGE_BYTES,
} from "@src/shared/backgroundImage";
import React, { useEffect, useState } from "react";

export interface BackgroundControlsProps {
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    liveSettings: Settings;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const MAX_IMAGE_MB = Math.round(MAX_BACKGROUND_IMAGE_BYTES / (1024 * 1024));

export function BackgroundControls({
    setLiveSettings,
    liveSettings,
    setIsEditing,
}: BackgroundControlsProps): JSX.Element {
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    useEffect(() => {
        getBackgroundImage(setImageDataUrl);
    }, []);

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

    const handleImageFile = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const file = event.currentTarget.files?.[0];
        // Reset so selecting the same file again still fires onChange.
        event.currentTarget.value = "";
        if (!file) return;

        if (
            !(ACCEPTED_BACKGROUND_IMAGE_TYPES as readonly string[]).includes(
                file.type,
            )
        ) {
            setImageError("Use a PNG, JPEG, WebP, or GIF image.");
            return;
        }

        if (file.size > MAX_BACKGROUND_IMAGE_BYTES) {
            setImageError(`Image must be ${MAX_IMAGE_MB} MB or smaller.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl =
                typeof reader.result === "string" ? reader.result : null;
            if (!dataUrl) {
                setImageError("Could not read that image.");
                return;
            }
            setImageError(null);
            setImageDataUrl(dataUrl);
            saveBackgroundImage(dataUrl);
            sendBackgroundImageToTab(dataUrl);
            applySettings({
                ...liveSettings,
                backgroundImageEnabled: true,
            });
        };
        reader.onerror = () => setImageError("Could not read that image.");
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (): void => {
        setImageDataUrl(null);
        setImageError(null);
        clearBackgroundImage();
        sendBackgroundImageToTab(null);
        applySettings({
            ...liveSettings,
            backgroundImageEnabled: false,
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
            <fieldset className="flex flex-col justify-center items-center bg-surface-elevated border border-edge rounded-lg p-3 gap-2 font-medium m-0 min-w-0 w-full">
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

            <hr className="border-edge" />

            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="rounded border-edge"
                    checked={liveSettings.backgroundImageEnabled}
                    onChange={(e) =>
                        handleToggle(
                            "backgroundImageEnabled",
                            e.currentTarget.checked,
                        )
                    }
                />
                Use background image
            </label>

            {liveSettings.backgroundImageEnabled ? (
                <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-14 w-14 shrink-0 rounded-md border border-edge bg-surface bg-cover bg-center"
                            aria-hidden="true"
                            style={
                                imageDataUrl
                                    ? {
                                          backgroundImage: `url("${imageDataUrl}")`,
                                      }
                                    : undefined
                            }
                        />
                        <div className="flex flex-wrap gap-2">
                            <label className="cursor-pointer rounded-md border border-edge bg-surface-elevated px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface">
                                {imageDataUrl
                                    ? "Replace image"
                                    : "Upload image"}
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept={ACCEPTED_BACKGROUND_IMAGE_ACCEPT}
                                    aria-label="Upload background image"
                                    onChange={handleImageFile}
                                />
                            </label>
                            {imageDataUrl ? (
                                <button
                                    type="button"
                                    className="rounded-md border border-edge bg-surface-elevated px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
                                    onClick={handleRemoveImage}
                                >
                                    Remove
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <p className="text-xs text-ink-muted">
                        PNG, JPEG, WebP, or GIF up to {MAX_IMAGE_MB} MB.
                    </p>

                    {imageError ? (
                        <p className="text-xs font-medium text-danger">
                            {imageError}
                        </p>
                    ) : null}

                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label
                                htmlFor="backgroundImageOpacity"
                                className="text-sm font-medium text-ink"
                            >
                                Image opacity
                            </label>
                            <span
                                className="text-xs text-ink-muted"
                                aria-hidden="true"
                            >
                                {liveSettings.backgroundImageOpacity}%
                            </span>
                        </div>
                        <input
                            type="range"
                            id="backgroundImageOpacity"
                            min="0"
                            max="100"
                            step="1"
                            className="control-range"
                            aria-label="Background image opacity"
                            value={liveSettings.backgroundImageOpacity}
                            onChange={(e) =>
                                applySettings({
                                    ...liveSettings,
                                    backgroundImageOpacity:
                                        e.currentTarget.value,
                                })
                            }
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
