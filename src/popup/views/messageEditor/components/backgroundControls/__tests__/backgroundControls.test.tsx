import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { BackgroundControls } from "../BackgroundControls";
import { defaultSettings, Settings } from "@src/shared/settings";
import { sendMessageToTab, sendBackgroundImageToTab } from "@src/shared/utils";
import { saveBackgroundImage } from "@src/lib/utilities";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
    sendBackgroundImageToTab: jest.fn(),
}));

jest.mock("@src/lib/utilities", () => ({
    getBackgroundImage: jest.fn((cb: (dataUrl: string | null) => void) =>
        cb(null),
    ),
    saveBackgroundImage: jest.fn(),
    clearBackgroundImage: jest.fn(),
}));

const buildSettings = (overrides: Partial<Settings> = {}): Settings => ({
    ...defaultSettings,
    ...overrides,
});

describe("BackgroundControls", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
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

    it("shows image upload and opacity controls when the image is enabled", () => {
        const component = renderer.create(
            <BackgroundControls
                setLiveSettings={jest.fn()}
                liveSettings={buildSettings({ backgroundImageEnabled: true })}
                setIsEditing={jest.fn()}
            />,
        );

        expect(
            component.root.findByProps({
                "aria-label": "Upload background image",
            }),
        ).toBeTruthy();
        expect(
            component.root.findByProps({ id: "backgroundImageOpacity" }),
        ).toBeTruthy();
    });

    it("live-previews background image opacity changes", () => {
        const setLiveSettings = jest.fn();
        const setIsEditing = jest.fn();
        const liveSettings = buildSettings({ backgroundImageEnabled: true });

        const component = renderer.create(
            <BackgroundControls
                setLiveSettings={setLiveSettings}
                liveSettings={liveSettings}
                setIsEditing={setIsEditing}
            />,
        );

        const slider = component.root.findByProps({
            id: "backgroundImageOpacity",
        });

        act(() => {
            slider.props.onChange({ currentTarget: { value: "60" } });
        });

        const expected = { ...liveSettings, backgroundImageOpacity: "60" };
        expect(setLiveSettings).toHaveBeenCalledWith(expected);
        expect(sendMessageToTab).toHaveBeenCalledWith(expected);
    });

    it("rejects unsupported image file types without saving", () => {
        const component = renderer.create(
            <BackgroundControls
                setLiveSettings={jest.fn()}
                liveSettings={buildSettings({ backgroundImageEnabled: true })}
                setIsEditing={jest.fn()}
            />,
        );

        const fileInput = component.root.findByProps({
            "aria-label": "Upload background image",
        });
        const file = new File(["x"], "bg.bmp", { type: "image/bmp" });

        act(() => {
            fileInput.props.onChange({
                currentTarget: { files: [file], value: "" },
            });
        });

        expect(saveBackgroundImage).not.toHaveBeenCalled();
        expect(sendBackgroundImageToTab).not.toHaveBeenCalled();
    });
});
