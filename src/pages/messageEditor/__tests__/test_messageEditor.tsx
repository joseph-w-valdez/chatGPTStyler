import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { MessageEditor, MessageEditorProps } from "../index";
import { MessageFormControl } from "@src/components/messageFormControl";

describe("MessageEditor Component", () => {
    let wrapper: ShallowWrapper;
    const mockProps: MessageEditorProps = {
        settings: {
            messageColorUserStyle: "",
            messageColorNonUserStyle: "",
            messageMaxWidthStyle: "",
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
        setSettings: jest.fn,
    };

    beforeEach(() => {
        wrapper = shallow(<MessageEditor {...mockProps} />);
    });

    it("renders correctly", () => {
        expect(wrapper).toMatchSnapshot();
    });

    // it("calls userMessageColorLiveChange on user message color change", () => {
    //     const colorValue = "blue";
    //     wrapper.find(MessageFormControl).at(0).prop("colorLiveChange")(
    //         colorValue,
    //     );
    //     expect(mockProps.userMessageColorLiveChange).toHaveBeenCalledWith(
    //         colorValue,
    //     );
    // });

    // it("calls chatMessageColorLiveChange on chat message color change", () => {
    //     const colorValue = "green";
    //     wrapper.find(MessageFormControl).at(1).prop("colorLiveChange")(
    //         colorValue,
    //     );
    //     expect(mockProps.chatMessageColorLiveChange).toHaveBeenCalledWith(
    //         colorValue,
    //     );
    // });

    // it("calls messageMaxWidthLiveChange on message max width change", () => {
    //     const event = {
    //         target: { value: "50%" },
    //     } as React.ChangeEvent<HTMLInputElement>;
    //     wrapper.find("#messageMaxWidthStyle").simulate("change", event);
    //     expect(mockProps.messageMaxWidthLiveChange).toHaveBeenCalledWith(event);
    // });
});
