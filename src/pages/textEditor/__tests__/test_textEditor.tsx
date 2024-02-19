import React from "react";
import { shallow } from "enzyme";
import { TextEditor } from "../component";
import { TextFormControls } from "@src/components/textFormControls/component";

// Mock the functions passed as props
const mockFunction = jest.fn();

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
                setPage={mockFunction}
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
                setPage={mockFunction}
            />,
        );

        // Assert that there are two TextFormControls components
        expect(wrapper.find(TextFormControls)).toHaveLength(2);
    });
});
