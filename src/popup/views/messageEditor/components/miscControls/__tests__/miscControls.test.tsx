import React from "react";
import renderer, { act } from "react-test-renderer";
import { MiscControls } from "../MiscControls";
import { defaultSettings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MiscControls", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with scroll to top enabled by default", () => {
        const tree = renderer
            .create(
                <MiscControls
                    liveSettings={defaultSettings}
                    setLiveSettings={jest.fn()}
                    setIsEditing={jest.fn()}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("disables scroll to top with live preview", () => {
        const setLiveSettings = jest.fn();
        const setIsEditing = jest.fn();
        const component = renderer.create(
            <MiscControls
                liveSettings={defaultSettings}
                setLiveSettings={setLiveSettings}
                setIsEditing={setIsEditing}
            />,
        );
        const checkbox = component.root.findByProps({
            "aria-label": "Enable scroll to top button",
        });

        act(() => {
            checkbox.props.onChange({ currentTarget: { checked: false } });
        });

        const expected = {
            ...defaultSettings,
            scrollToTopEnabled: false,
        };
        expect(setLiveSettings).toHaveBeenCalledWith(expected);
        expect(sendMessageToTab).toHaveBeenCalledWith(expected);
        expect(setIsEditing).toHaveBeenCalledWith(true);
    });

    it("changes the popup theme without messaging the ChatGPT tab", () => {
        const setLiveSettings = jest.fn();
        const setIsEditing = jest.fn();
        const component = renderer.create(
            <MiscControls
                liveSettings={defaultSettings}
                setLiveSettings={setLiveSettings}
                setIsEditing={setIsEditing}
            />,
        );
        const themeSelect = component.root.findByProps({
            "aria-label": "Color theme",
        });

        act(() => {
            themeSelect.props.onChange({
                currentTarget: { value: "dark" },
            });
        });

        expect(setLiveSettings).toHaveBeenCalledWith({
            ...defaultSettings,
            themePreference: "dark",
        });
        expect(setIsEditing).toHaveBeenCalledWith(true);
        expect(sendMessageToTab).not.toHaveBeenCalled();
    });
});
