import React from "react";
import { mount } from "enzyme";
import { MessageFormControl, MessageFormControlProps } from "../component";

describe("MessageFormControl component", () => {
    const defaultProps: MessageFormControlProps = {
        setLiveChanges: jest.fn(),
        liveChanges: {
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
        sendMessageToRuntime: jest.fn(),
    };

    const mountComponent = (props?: Partial<MessageFormControlProps>) => {
        const mergedProps = { ...defaultProps, ...props };
        return mount(<MessageFormControl {...mergedProps} />);
    };

    it("renders correctly", () => {
        const wrapper = mountComponent();
        expect(wrapper).toMatchSnapshot();
    });

    it("updates colorType and colorCode correctly for HEX", () => {
        const wrapper = mountComponent();

        wrapper.find("select").simulate("change", { target: { value: "hex" } });
        wrapper
            .find("input")
            .simulate("change", { target: { value: "1a2b3c" } });

        expect(wrapper).toMatchSnapshot();
    });

    it("updates colorType and colorCode correctly for RGB", () => {
        const wrapper = mountComponent();

        wrapper.find("select").simulate("change", { target: { value: "rgb" } });
        wrapper
            .find("input")
            .simulate("change", { target: { value: "255, 0, 0" } });

        expect(wrapper).toMatchSnapshot();
    });
});
