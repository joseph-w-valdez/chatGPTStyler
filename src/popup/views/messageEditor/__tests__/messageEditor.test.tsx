import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { MessageEditor, MessageEditorProps } from "../index";
import { MessageSliderControls } from "../components/messageSliderControls";
import { ColorControls } from "../components/colorControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
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

        slider.props.setLiveSettings(mockProps.liveSettings);

        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(
            mockProps.liveSettings,
        );
    });

    it("passes setLiveSettings through ColorControls", () => {
        const colors = component.root.findByType(ColorControls);

        colors.props.setLiveSettings(mockProps.liveSettings);

        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(
            mockProps.liveSettings,
        );
    });

    it("wires live settings into MessageSliderControls", () => {
        const slider = component.root.findByType(MessageSliderControls);

        expect(slider.props.liveSettings).toEqual(mockProps.liveSettings);
        expect(slider.props.setLiveSettings).toBe(mockProps.setLiveSettings);
    });

    it("restores storage-loaded settings when Cancel is clicked", () => {
        const loadedSettings = {
            ...mockProps.liveSettings,
            messageMaxWidthStyle: "72",
            messageColorUserStyle: "#123456",
        };

        act(() => {
            component.update(
                <MessageEditor
                    liveSettings={loadedSettings}
                    setLiveSettings={mockProps.setLiveSettings}
                />,
            );
        });

        act(() => {
            component.root.findByType(FormButtons).props.setIsEditing(true);
        });

        const cancelButton = component.root
            .findAllByType("button")
            .find((button) => button.children.includes("Cancel"));

        if (!cancelButton) throw new Error("Cancel button not found");

        act(() => {
            cancelButton.props.onClick();
        });

        expect(mockProps.setLiveSettings).toHaveBeenCalledWith(loadedSettings);
    });
});
