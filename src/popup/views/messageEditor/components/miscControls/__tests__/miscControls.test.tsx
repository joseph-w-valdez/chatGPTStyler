import React from "react";
import renderer, { act } from "react-test-renderer";
import { MiscControls } from "../MiscControls";
import { defaultSettings } from "@src/shared/settings";
import { sendMessageToTab } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MiscControls", () => {
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
});
