import React from "react";
import renderer from "react-test-renderer";
import { ColorControls } from "../ColorControls";

test("ColorControls component renders correctly", () => {
    const setLiveSettings = jest.fn();
    const liveSettings = {
        messageMaxWidthStyle: "95",
        messagePaddingStyle: "10",
        messageBorderRadiusStyle: "5",
        messageColorUserStyle: "#386d9f",
        messageColorNonUserStyle: "#333333",
        inputBoxMaxWidthStyle: "94",
        textColorUserStyle: "#FFFFFF",
        textColorNonUserStyle: "#FFFFFF",
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
