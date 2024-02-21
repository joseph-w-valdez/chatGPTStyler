// test_TextFormControlsProps.tsx

import React from "react";
import { mount } from "enzyme"; // Enzyme for testing
import { act } from "react-dom/test-utils"; // For simulating events
import { TextFormControls, TextFormControlsProps } from "../component";

// Mock the functions passed as props
const mockColorLiveChange = jest.fn();
const mockFontSizeOnChange = jest.fn();
const mockFontWeightOnChange = jest.fn();

// Mock the props
const mockProps: TextFormControlsProps = {
    section: "Test",
    colorLiveChange: mockColorLiveChange,
    fontSizeOnChange: mockFontSizeOnChange,
    fontWeightOnChange: mockFontWeightOnChange,
    option: {
        messageMaxWidthStyle: "",
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        textSizeUserStyle: "",
        textSizeNonUserStyle: "",
        textWeightUserStyle: "",
        textWeightNonUserStyle: "",
    },
    applyUpdates: jest.fn(),
};

// Test to ensure that TextFormControls renders correctly
test("TextFormControls renders correctly", () => {
    const wrapper = mount(<TextFormControls {...mockProps} />);

    // Assert that the component renders correctly
    expect(wrapper.text()).toContain("Test Text");
    expect(wrapper.find('label[htmlFor="textColor"]').text()).toContain(
        "Text Color:",
    );
    expect(wrapper.find('label[htmlFor="fontSize"]').text()).toContain(
        "Font Size:",
    );
    expect(wrapper.find('label[htmlFor="fontWeight"]').text()).toContain(
        "Font Weight:",
    );

    // You can add more assertions based on your component's structure
});

// Test to ensure that TextFormControls updates state and calls colorLiveChange on color type change
test("TextFormControls updates state and calls colorLiveChange on color type change", () => {
    const wrapper = mount(<TextFormControls {...mockProps} />);

    // Select color type
    act(() => {
        wrapper.find('select[name="colorType"]').simulate("change", {
            target: { value: "name" },
        });
    });

    // Assert that state is updated
    expect(wrapper.find('input[name="textColor"]').prop("placeholder")).toEqual(
        "Color Name",
    );

    // Assert that colorLiveChange is called with the correct value
    expect(mockColorLiveChange).toHaveBeenCalledWith("");
});
