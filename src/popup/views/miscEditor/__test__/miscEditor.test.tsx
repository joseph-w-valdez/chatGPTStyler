import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { MiscEditor, MessageEditorProps } from "../component";

describe("MiscEditor Component", () => {
    let wrapper: ShallowWrapper<MessageEditorProps>;

    const mockSetLiveSettings = jest.fn();
    const mockSendMessageToTab = jest.fn();

    const defaultProps: MessageEditorProps = {
        liveSettings: {
            messageColorUserStyle: "",
            messageColorNonUserStyle: "",
            messageMaxWidthStyle: "",
            messagePaddingStyle: "",
            messageBorderRadiusStyle: "",
            inputBoxMaxWidthStyle: "",
            textColorUserStyle: "",
            textColorNonUserStyle: "",
            messageButtonsVisibilityStyle: true,
        },
        setLiveSettings: mockSetLiveSettings,
    };

    beforeEach(() => {
        wrapper = shallow(<MiscEditor {...defaultProps} />);
    });

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });

    it("handles checkbox change correctly", () => {
        const checkbox = wrapper.find("input[type='checkbox']");
        checkbox.simulate("change");

        expect(mockSetLiveSettings).toHaveBeenCalledWith({
            ...defaultProps.liveSettings,
            messageButtonsVisibilityStyle:
                !defaultProps.liveSettings.messageButtonsVisibilityStyle,
        });

        expect(mockSendMessageToTab).toHaveBeenCalledWith(
            "messageButtonsVisibilityStyle",
            !defaultProps.liveSettings.messageButtonsVisibilityStyle,
        );
    });
});
