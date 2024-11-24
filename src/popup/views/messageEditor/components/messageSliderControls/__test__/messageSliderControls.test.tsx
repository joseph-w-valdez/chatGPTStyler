import React from "react";
import renderer from "react-test-renderer";
import { MessageSliderControls } from "../component";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MessageSliderControls component", () => {
    it("renders correctly", () => {
        const setLiveChangesMock = jest.fn();
        const setIsEditingMock = jest.fn();

        const tree = renderer
            .create(
                <MessageSliderControls
                    setLiveChanges={setLiveChangesMock}
                    liveChanges={{
                        messageMaxWidthStyle: "95",
                        messagePaddingStyle: "10",
                        messageBorderRadiusStyle: "5",
                        messageColorUserStyle: "#386d9f",
                        messageColorNonUserStyle: "#333333",
                        messageButtonsVisibilityStyle: false,
                        inputBoxMaxWidthStyle: "94",
                        textColorUserStyle: "#FFFFFF",
                        textColorNonUserStyle: "#FFFFFF",
                    }}
                    setIsEditing={setIsEditingMock}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
