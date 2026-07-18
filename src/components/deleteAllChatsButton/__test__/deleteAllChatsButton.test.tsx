import React from "react";
import renderer, { act, ReactTestInstance } from "react-test-renderer";
import { DeleteAllChatsButton } from "../DeleteAllChatsButton";

const findButtonByText = (
    instance: ReactTestInstance,
    text: string,
): ReactTestInstance => {
    return instance
        .findAllByType("button")
        .find((button) => button.children.includes(text)) as ReactTestInstance;
};

describe("DeleteAllChatsButton", () => {
    beforeEach(() => {
        (chrome.tabs.query as jest.Mock).mockImplementation(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id: number; url: string }>) => void,
            ) => {
                callback([{ id: 1, url: "https://chatgpt.com/" }]);
            },
        );
    });

    it("should render the initial button", () => {
        const tree = renderer.create(<DeleteAllChatsButton />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should toggle the confirmation buttons when 'Delete All Conversations' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        const deleteButton = findButtonByText(
            instance,
            "Delete All Conversations",
        );

        act(() => {
            deleteButton.props.onClick();
        });

        const confirmationSection = instance.findByProps({
            className: "grid place-items-center gap-2",
        });
        expect(confirmationSection).toBeTruthy();

        act(() => {
            deleteButton.props.onClick();
        });

        expect(() => {
            instance.findByProps({
                className: "grid place-items-center gap-2",
            });
        }).toThrow();
    });

    it("should call deleteAllChats when 'Yes' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        const deleteButton = findButtonByText(
            instance,
            "Delete All Conversations",
        );
        act(() => {
            deleteButton.props.onClick();
        });

        const yesButton = findButtonByText(instance, "Yes");
        act(() => {
            yesButton.props.onClick();
        });

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            1,
            { action: "deleteMessages" },
            expect.any(Function),
        );
    });

    it("should close the confirmation when 'No' is clicked", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        const deleteButton = findButtonByText(
            instance,
            "Delete All Conversations",
        );
        act(() => {
            deleteButton.props.onClick();
        });

        const noButton = findButtonByText(instance, "No");
        act(() => {
            noButton.props.onClick();
        });

        expect(() => {
            instance.findByProps({
                className: "grid place-items-center gap-2",
            });
        }).toThrow();
    });
});
