import * as React from "react";
import { mount } from "enzyme";
import { MessageFormControl } from "../index"; // Adjust the import path based on your project structure

describe("MessageFormControl component", () => {
    it("renders correctly", () => {
        const wrapper = mount(
            <MessageFormControl section="Test" colorLiveChange={jest.fn()} />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it("updates colorType and colorCode correctly for HEX", () => {
        const wrapper = mount(
            <MessageFormControl section="Test" colorLiveChange={jest.fn()} />,
        );

        wrapper.find("select").simulate("change", { target: { value: "hex" } });
        wrapper
            .find("input")
            .simulate("change", { target: { value: "1a2b3c" } });

        expect(wrapper).toMatchSnapshot();
    });

    it("updates colorType and colorCode correctly for RGB", () => {
        const wrapper = mount(
            <MessageFormControl section="Test" colorLiveChange={jest.fn()} />,
        );

        wrapper.find("select").simulate("change", { target: { value: "rgb" } });
        wrapper
            .find("input")
            .simulate("change", { target: { value: "255, 0, 0" } });

        expect(wrapper).toMatchSnapshot();
    });
});
