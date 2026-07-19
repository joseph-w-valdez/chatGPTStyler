import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { BackgroundControls } from "../BackgroundControls";
import { defaultSettings, Settings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

const buildSettings = (overrides: Partial<Settings> = {}): Settings => ({
    ...defaultSettings,
    ...overrides,
});

describe("BackgroundControls", () => {
    it("renders the opt-in state by default", () => {
        const tree = renderer
            .create(
                <BackgroundControls
                    setLiveSettings={jest.fn()}
                    liveSettings={buildSettings()}
                    setIsEditing={jest.fn()}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("renders separate conversation and sidebar pickers when enabled", () => {
        const tree = renderer
            .create(
                <BackgroundControls
                    setLiveSettings={jest.fn()}
                    liveSettings={buildSettings({
                        customBackgroundsEnabled: true,
                        syncBackgroundColors: false,
                    })}
                    setIsEditing={jest.fn()}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("renders a single synced picker when sync is enabled", () => {
        const tree = renderer
            .create(
                <BackgroundControls
                    setLiveSettings={jest.fn()}
                    liveSettings={buildSettings({
                        customBackgroundsEnabled: true,
                        syncBackgroundColors: true,
                    })}
                    setIsEditing={jest.fn()}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("live-previews conversation color changes", () => {
        const setLiveSettings = jest.fn();
        const setIsEditing = jest.fn();
        const liveSettings = buildSettings({
            customBackgroundsEnabled: true,
            syncBackgroundColors: false,
        });

        let component: ReactTestRenderer | undefined;
        act(() => {
            component = renderer.create(
                <BackgroundControls
                    setLiveSettings={setLiveSettings}
                    liveSettings={liveSettings}
                    setIsEditing={setIsEditing}
                />,
            );
        });

        if (!component) {
            throw new Error("BackgroundControls failed to render");
        }

        const colorInput = component.root.findByProps({
            id: "conversationBackgroundStyle",
        });

        act(() => {
            colorInput.props.onChange({
                currentTarget: { value: "#abcdef" },
            });
        });

        const expected = {
            ...liveSettings,
            conversationBackgroundStyle: "#abcdef",
        };
        expect(setLiveSettings).toHaveBeenCalledWith(expected);
        expect(sendMessageToTab).toHaveBeenCalledWith(expected);
        expect(setIsEditing).toHaveBeenCalledWith(true);
    });
});
