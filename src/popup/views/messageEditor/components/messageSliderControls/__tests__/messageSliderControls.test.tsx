import React from "react";
import renderer from "react-test-renderer";
import { MessageSliderControls } from "../MessageSliderControls";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MessageSliderControls component", () => {
    it("renders correctly", () => {
        const setLiveSettingsMock = jest.fn();
        const setIsEditingMock = jest.fn();

        const tree = renderer
            .create(
                <MessageSliderControls
                    setLiveSettings={setLiveSettingsMock}
                    liveSettings={{
                        messageMaxWidthStyle: "95",
                        messagePaddingStyle: "10",
                        messageBorderRadiusStyle: "5",
                        messageColorUserStyle: "#386d9f",
                        messageColorNonUserStyle: "#333333",
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
