import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { MessageEditor, MessageEditorProps } from "../index";
import { MessageSliderControls } from "../components/MessageSliderControls";
import { ColorControls } from "../components/ColorControls";

describe("MessageEditor Component", () => {
    let wrapper: ShallowWrapper;
    const mockProps: MessageEditorProps = {
        liveSettings: {
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
            messageButtonsVisibilityStyle: true,
        },
        setLiveSettings: jest.fn,
    };

    beforeEach(() => {
        wrapper = shallow(<MessageEditor {...mockProps} />);
    });

    it("renders correctly", () => {
        expect(wrapper).toMatchSnapshot();
    });

    it("calls setLiveChanges on user message color change", () => {
        const liveChanges = mockProps.liveSettings;
        wrapper.find(MessageSliderControls).at(0).prop("setLiveChanges")(
            liveChanges,
        );
        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(liveChanges);
    });

    it("calls setLiveChanges on chat message color change", () => {
        const liveChanges = mockProps.liveSettings;
        wrapper.find(ColorControls).at(1).prop("setLiveChanges")(liveChanges);
        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(liveChanges);
    });

    it("calls messageMaxWidthLiveChange on message max width change", () => {
        const event = {
            target: { value: "50%" },
        } as React.ChangeEvent<HTMLInputElement>;
        wrapper.find("#messageMaxWidthStyle").simulate("change", event);
        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(event);
    });
});
