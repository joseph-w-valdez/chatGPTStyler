import React from "react";
import renderer from "react-test-renderer";
import { DeleteAllChatsButton } from "../DeleteAllChatsButton";
import { act } from "react-dom/test-utils";

// Mocking chrome.tabs.sendMessage to avoid side effects in testing
global.chrome = {
    tabs: {
        query: jest.fn((_, callback) => callback([{ id: 1 }])),
        sendMessage: jest.fn(),
    },
} as any;

describe("DeleteAllChatsButton", () => {
    it("should render the initial button", () => {
        const tree = renderer.create(<DeleteAllChatsButton />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should toggle the confirmation buttons when 'Delete All Conversations' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        // Find the "Delete All Conversations" button
        const deleteButton = instance.findByType("button");

        // Simulate the click on the delete button to toggle the state
        act(() => {
            deleteButton.props.onClick();
        });

        // Check if the confirmation section is now visible
        const confirmationSection = instance.findByProps({
            className: "grid place-items-center gap-2",
        });
        expect(confirmationSection).toBeTruthy();

        // Simulate the click to toggle back
        act(() => {
            deleteButton.props.onClick();
        });

        // Ensure the confirmation section is hidden again
        expect(() => {
            instance.findByProps({
                className: "grid place-items-center gap-2",
            });
        }).toThrow();
    });

    it("should call deleteAllChats when 'Yes' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        // Simulate clicking the 'Delete All Conversations' button to show the confirmation
        const deleteButton = instance.findByType("button");
        act(() => {
            deleteButton.props.onClick();
        });

        // Find the 'Yes' button and simulate click
        const yesButton = instance.findByProps({ className: "yesBtn" });
        act(() => {
            yesButton.props.onClick();
        });

        // Check if chrome.tabs.sendMessage was called
        expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
            action: "deleteMessages",
        });
    });

    it("should close the confirmation when 'No' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        // Simulate clicking the 'Delete All Conversations' button to show the confirmation
        const deleteButton = instance.findByType("button");
        act(() => {
            deleteButton.props.onClick();
        });

        // Find the 'No' button and simulate click
        const noButton = instance.findByProps({ className: "noBtn" });
        act(() => {
            noButton.props.onClick();
        });

        // Ensure the confirmation section is hidden again
        expect(() => {
            instance.findByProps({
                className: "grid place-items-center gap-2",
            });
        }).toThrow();
    });
});
