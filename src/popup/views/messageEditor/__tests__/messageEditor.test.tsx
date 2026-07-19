import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { MessageEditor, MessageEditorProps } from "../index";
import { MessageSliderControls } from "../components/messageSliderControls";
import { ColorControls } from "../components/colorControls";
import { FormButtons } from "@src/components/formButtons/FormButtons";
import { defaultSettings } from "@src/shared/settings";

jest.mock("@src/shared/utils", () => ({
    sendMessageToTab: jest.fn(),
}));

describe("MessageEditor Component", () => {
    let component: ReactTestRenderer;
    const mockProps: MessageEditorProps = {
        liveSettings: { ...defaultSettings },
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

    it("switches to the Background tab panel", () => {
        const backgroundTab = component.root
            .findAllByType("button")
            .find((button) => button.props.id === "background-tab");

        if (!backgroundTab) throw new Error("Background tab not found");

        act(() => {
            backgroundTab.props.onClick();
        });

        expect(
            component.root.findByProps({ id: "background-panel" }),
        ).toBeTruthy();
        expect(
            component.root.findAllByProps({ id: "messages-panel" }),
        ).toHaveLength(0);
    });

    it("moves delete-all and scroll-to-top settings into the Misc tab", () => {
        expect(
            component.root.findAllByProps({
                "aria-label": "Enable scroll to top button",
            }),
        ).toHaveLength(0);

        const miscTab = component.root
            .findAllByType("button")
            .find((button) => button.props.id === "misc-tab");

        if (!miscTab) throw new Error("Misc tab not found");

        act(() => {
            miscTab.props.onClick();
        });

        expect(component.root.findByProps({ id: "misc-panel" })).toBeTruthy();
        expect(
            component.root.findByProps({
                "aria-label": "Enable scroll to top button",
            }).props.checked,
        ).toBe(true);
        expect(
            component.root
                .findAllByType("button")
                .some((button) =>
                    button.children.includes("Delete All Conversations"),
                ),
        ).toBe(true);
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
