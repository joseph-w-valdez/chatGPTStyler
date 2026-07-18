import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import { MessageEditor, MessageEditorProps } from "../index";
import { MessageSliderControls } from "../components/messageSliderControls";
import { ColorControls } from "../components/colorControl/component";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
    loadSettings: jest.fn(),
}));

describe("MessageEditor Component", () => {
    let component: ReactTestRenderer;
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
            messageButtonsVisibilityStyle: true,
        },
        setLiveSettings: jest.fn(),
    };

    beforeEach(() => {
        component = renderer.create(<MessageEditor {...mockProps} />);
    });

    it("renders correctly", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("passes setLiveSettings through MessageSliderControls", () => {
        const slider = component.root.findByType(MessageSliderControls);
        const liveChanges = mockProps.liveSettings;

        slider.props.setLiveChanges(liveChanges);

        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(liveChanges);
    });

    it("passes setLiveSettings through ColorControls", () => {
        const colors = component.root.findByType(ColorControls);
        const liveChanges = mockProps.liveSettings;

        colors.props.setLiveChanges(liveChanges);

        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(liveChanges);
    });

    it("wires live settings into MessageSliderControls", () => {
        const slider = component.root.findByType(MessageSliderControls);

        expect(slider.props.liveChanges).toEqual(mockProps.liveSettings);
        expect(slider.props.setLiveChanges).toBe(mockProps.setLiveSettings);
    });
});
