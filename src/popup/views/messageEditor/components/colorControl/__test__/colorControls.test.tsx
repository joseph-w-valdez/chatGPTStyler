import React from "react";
import renderer from "react-test-renderer";
import { ColorControls } from "../component";

test("ColorControls component renders correctly", () => {
    const setLiveChanges = jest.fn();
    const liveChanges = {
        messageMaxWidthStyle: "95",
        messagePaddingStyle: "10",
        messageBorderRadiusStyle: "5",
        messageColorUserStyle: "#386d9f",
        messageColorNonUserStyle: "#333333",
        messageButtonsVisibilityStyle: false,
        inputBoxMaxWidthStyle: "94",
        textColorUserStyle: "#FFFFFF",
        textColorNonUserStyle: "#FFFFFF",
    };
    const setIsEditing = jest.fn();

    const component = renderer.create(
        <ColorControls
            setLiveChanges={setLiveChanges}
            liveChanges={liveChanges}
            setIsEditing={setIsEditing}
        />,
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
