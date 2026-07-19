import { Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";
import React from "react";

export interface MessageSliderControlsProps {
    setLiveSettings: React.Dispatch<React.SetStateAction<Settings>>;
    liveSettings: Settings;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

type InputSetting = {
    name: string;
    id: keyof Settings;
    valueType: "px" | "%";
};

const inputSettings: InputSetting[] = [
    {
        name: "Message Width",
        id: "messageMaxWidthStyle",
        valueType: "%",
    },
    {
        name: "Message Padding",
        id: "messagePaddingStyle",
        valueType: "px",
    },
    {
        name: "Message Border",
        id: "messageBorderRadiusStyle",
        valueType: "px",
    },
    {
        name: "Input Box Width",
        id: "inputBoxMaxWidthStyle",
        valueType: "%",
    },
];

export function MessageSliderControls({
    setLiveSettings,
    liveSettings,
    setIsEditing,
}: MessageSliderControlsProps): JSX.Element {
    const mapInputSettings = (setting: InputSetting) => {
        const rangeId = `${setting.id}-range`;

        const handleOnChange = (
            e: React.ChangeEvent<HTMLInputElement>,
            settingKey: keyof Settings,
        ) => {
            const regex = /^\d+$/;
            if (regex.test(e.target.value)) {
                let currValue = e.target.value;
                if (Number(currValue) > 100) currValue = "100";
                const nextSettings = {
                    ...liveSettings,
                    [settingKey]: currValue,
                };
                setIsEditing(true);
                setLiveSettings(nextSettings);
                sendMessageToTab(nextSettings);
            }
        };

        return (
            <div className="grid gap-1.5" key={setting.id}>
                <div className="flex items-center justify-between gap-2">
                    <label
                        htmlFor={setting.id}
                        className="text-sm font-medium text-ink"
                    >
                        {setting.name}
                    </label>
                    <div className="flex items-center rounded-md border border-edge bg-surface-raised overflow-hidden">
                        <input
                            className="w-12 px-2 py-1 text-sm text-right text-ink bg-transparent outline-none"
                            type="text"
                            maxLength={3}
                            inputMode="numeric"
                            value={liveSettings[setting.id].toString()}
                            id={setting.id}
                            onChange={(e) => handleOnChange(e, setting.id)}
                        />
                        <span
                            className="px-2 py-1 text-xs text-ink-muted border-l border-edge select-none"
                            aria-hidden="true"
                        >
                            {setting.valueType}
                        </span>
                    </div>
                </div>
                <input
                    type="range"
                    id={rangeId}
                    min="1"
                    max="100"
                    value={liveSettings[setting.id].toString()}
                    className="control-range"
                    onChange={(e) => handleOnChange(e, setting.id)}
                    step={"1"}
                    aria-label={`${setting.name} slider`}
                />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-y-3">
            {inputSettings.map(mapInputSettings)}
        </div>
    );
}
