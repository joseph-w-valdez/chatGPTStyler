import React from "react";
import { shallow } from "enzyme";
import { TextEditor } from "../component";
import { TextFormControls } from "@src/components/textFormControls/component";
import { OptionsTypes } from "@src/lib/utilities/googleStorage";

// Mock the functions passed as props
const mockFunction = jest.fn();

const defaultOptions = {
    textColorUserStyle: "000000",
    textColorNonUserStyle: "000000",
    messageMaxWidthStyle: "100%",
    messageColorUserStyle: "000000",
    messageColorNonUserStyle: "000000",
    messagePaddingStyle: "12%",
    messageBorderRadiusStyle: "15%",
    inputBoxMaxWidthStyle: "51",
    textSizeUserStyle: "23",
    textSizeNonUserStyle: "13",
    textWeightUserStyle: "100",
    textWeightNonUserStyle: "100",
};

describe("TextEditor component", () => {
    it("renders correctly", () => {
        // Shallow render the TextEditor component with mock functions for props
        const wrapper = shallow(
            <TextEditor
                userColorLiveChange={mockFunction}
                userFontSizeOnChange={mockFunction}
                userFontWeightOnChange={mockFunction}
                chatColorLiveChange={mockFunction}
                chatFontSizeOnChange={mockFunction}
                chatFontWeightOnChange={mockFunction}
                options={defaultOptions}
                setOptions={mockFunction}
            />,
        );

        // Assert that the component renders the expected structure
        expect(wrapper).toMatchSnapshot();
    });

    it("renders two TextFormControls components", () => {
        // Shallow render the TextEditor component with mock functions for props
        const wrapper = shallow(
            <TextEditor
                userColorLiveChange={mockFunction}
                userFontSizeOnChange={mockFunction}
                userFontWeightOnChange={mockFunction}
                chatColorLiveChange={mockFunction}
                chatFontSizeOnChange={mockFunction}
                chatFontWeightOnChange={mockFunction}
                setOptions={mockFunction}
                options={defaultOptions}
            />,
        );

        // Assert that there are two TextFormControls components
        expect(wrapper.find(TextFormControls)).toHaveLength(2);
    });
});
