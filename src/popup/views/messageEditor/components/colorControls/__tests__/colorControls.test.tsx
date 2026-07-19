import React from "react";
import renderer from "react-test-renderer";
import { ColorControls } from "../ColorControls";
import { defaultSettings } from "@src/shared/settings";

test("ColorControls component renders correctly", () => {
    const setLiveSettings = jest.fn();
    const liveSettings = {
        ...defaultSettings,
        messageColorUserStyle: "#386d9f",
    };
    const setIsEditing = jest.fn();

    const component = renderer.create(
        <ColorControls
            setLiveSettings={setLiveSettings}
            liveSettings={liveSettings}
            setIsEditing={setIsEditing}
        />,
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
