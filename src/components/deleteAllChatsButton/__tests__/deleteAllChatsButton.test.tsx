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

const hasStatusText = (instance: ReactTestInstance, text: string): boolean => {
    return instance
        .findAllByType("p")
        .some(
            (node) =>
                node.props.role === "status" && node.children.includes(text),
        );
};

describe("DeleteAllChatsButton", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (chrome.runtime as { lastError?: chrome.runtime.LastError }).lastError =
            undefined;
        (chrome.tabs.query as jest.Mock).mockImplementation(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id: number; url: string }>) => void,
            ) => {
                callback([{ id: 1, url: "https://chatgpt.com/" }]);
            },
        );
        (chrome.tabs.sendMessage as jest.Mock).mockImplementation(
            (
                _tabId: number,
                _message: unknown,
                callback?: (response: {
                    status: "SUCCESS" | "FAILURE";
                    message?: string;
                }) => void,
            ) => {
                if (callback) callback({ status: "SUCCESS" });
            },
        );
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
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

    it("should show success only after the content script responds", () => {
        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        act(() => {
            findButtonByText(
                instance,
                "Delete All Conversations",
            ).props.onClick();
        });
        act(() => {
            findButtonByText(instance, "Yes").props.onClick();
        });

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            1,
            { action: "deleteMessages" },
            expect.any(Function),
        );
        expect(hasStatusText(instance, "All chats have been deleted!")).toBe(
            true,
        );
    });

    it("should show the failure message from the content script", () => {
        (chrome.tabs.sendMessage as jest.Mock).mockImplementation(
            (
                _tabId: number,
                _message: unknown,
                callback?: (response: {
                    status: "SUCCESS" | "FAILURE";
                    message?: string;
                }) => void,
            ) => {
                if (callback) {
                    callback({
                        status: "FAILURE",
                        message: "No chat history found",
                    });
                }
            },
        );

        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        act(() => {
            findButtonByText(
                instance,
                "Delete All Conversations",
            ).props.onClick();
        });
        act(() => {
            findButtonByText(instance, "Yes").props.onClick();
        });

        expect(hasStatusText(instance, "No chat history found")).toBe(true);
    });

    it("should reject non-ChatGPT tabs", () => {
        (chrome.tabs.query as jest.Mock).mockImplementation(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id: number; url: string }>) => void,
            ) => {
                callback([{ id: 1, url: "https://example.com/" }]);
            },
        );

        const component = renderer.create(<DeleteAllChatsButton />);
        const instance = component.root;

        act(() => {
            findButtonByText(
                instance,
                "Delete All Conversations",
            ).props.onClick();
        });
        act(() => {
            findButtonByText(instance, "Yes").props.onClick();
        });

        expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
        expect(hasStatusText(instance, "Active tab is not ChatGPT")).toBe(true);
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
