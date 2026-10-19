import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { RepairLayoutButton } from "../RepairLayoutButton";
import { RepairSelectorsResponse } from "@src/shared/messaging";

const respondWith = (response: RepairSelectorsResponse): void => {
    (chrome.tabs.sendMessage as jest.Mock).mockImplementation(
        (_tabId: number, _message: unknown, callback: (r: unknown) => void) =>
            callback(response),
    );
};

const clickButton = (component: ReactTestRenderer, text: string): void => {
    const button = component.root
        .findAllByType("button")
        .find((candidate) => candidate.children.includes(text));
    if (!button) throw new Error(`No "${text}" button`);
    act(() => button.props.onClick());
};

const statusText = (component: ReactTestRenderer): string =>
    component.root.findByProps({ role: "status" }).children.join("");

describe("RepairLayoutButton", () => {
    it("asks the ChatGPT tab to repair and reports what was fixed", () => {
        respondWith({
            status: "SUCCESS",
            summary: {
                repaired: [
                    { label: "User message bubble", selector: "[data-x]" },
                ],
                stillBroken: [],
                healthy: 9,
                activeRepairs: 1,
            },
        });
        const component = renderer.create(<RepairLayoutButton />);

        clickButton(component, "Repair layout");

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            1,
            { action: "repairSelectors" },
            expect.any(Function),
        );
        expect(statusText(component)).toBe("Repaired 1: User message bubble.");
    });

    it("says so when nothing needed repair", () => {
        respondWith({
            status: "SUCCESS",
            summary: {
                repaired: [],
                stillBroken: [],
                healthy: 12,
                activeRepairs: 0,
            },
        });
        const component = renderer.create(<RepairLayoutButton />);

        clickButton(component, "Repair layout");

        expect(statusText(component)).toContain("Nothing needed repair");
    });

    it("undoes saved repairs", () => {
        respondWith({
            status: "SUCCESS",
            summary: {
                repaired: [],
                stillBroken: [],
                healthy: 0,
                activeRepairs: 0,
            },
        });
        const component = renderer.create(<RepairLayoutButton />);

        clickButton(component, "Undo repairs");

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
            1,
            { action: "resetSelectorRepairs" },
            expect.any(Function),
        );
        expect(statusText(component)).toContain("Repairs removed");
    });
});
