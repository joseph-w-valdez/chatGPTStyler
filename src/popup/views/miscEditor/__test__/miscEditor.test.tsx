import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { MiscEditor, MessageEditorProps } from "../component";
import { sendMessageToTab } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MiscEditor Component", () => {
    let component: ReactTestRenderer;

    const mockSetLiveSettings = jest.fn();

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
        component = renderer.create(<MiscEditor {...defaultProps} />);
    });

    it("renders correctly", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("handles checkbox change correctly", () => {
        const checkbox = component.root.findByProps({ type: "checkbox" });

        act(() => {
            checkbox.props.onChange();
        });

        expect(mockSetLiveSettings).toHaveBeenCalledWith({
            ...defaultProps.liveSettings,
            messageButtonsVisibilityStyle:
                !defaultProps.liveSettings.messageButtonsVisibilityStyle,
        });

        expect(sendMessageToTab).toHaveBeenCalledWith({
            ...defaultProps.liveSettings,
            messageButtonsVisibilityStyle:
                !defaultProps.liveSettings.messageButtonsVisibilityStyle,
        });
    });
});
