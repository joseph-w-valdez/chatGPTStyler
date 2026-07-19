import React from "react";
import renderer from "react-test-renderer";
import { MessageSliderControls } from "../MessageSliderControls";
import { defaultSettings } from "@src/shared/settings";

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
                        ...defaultSettings,
                        messageColorUserStyle: "#386d9f",
                    }}
                    setIsEditing={setIsEditingMock}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
