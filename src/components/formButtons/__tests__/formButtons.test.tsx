import React from "react";
import renderer from "react-test-renderer";
import { FormButtons } from "../FormButtons";

const mockFunction = jest.fn();
const settings = {
    messageMaxWidthStyle: "",
    messageColorUserStyle: "",
    messageColorNonUserStyle: "",
    messagePaddingStyle: "",
    messageBorderRadiusStyle: "",
    inputBoxMaxWidthStyle: "",
    textColorUserStyle: "",
    textColorNonUserStyle: "",
    messageButtonsVisibilityStyle: false,
};

describe("FormButtons", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(
                <FormButtons
                    isEditing={false}
                    setIsEditing={mockFunction}
                    liveSettings={settings}
                    setLiveSettings={mockFunction}
                    savedSettings={settings}
                    setSavedSettings={mockFunction}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
