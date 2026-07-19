import * as React from "react";
import { Popup } from "../Popup";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { defaultSettings } from "@src/shared/settings";

it("component renders", () => {
    const tree = renderer.create(<Popup />).toJSON();
    expect(tree).toMatchSnapshot();
});

it("applies an explicit saved theme to the popup document", () => {
    const getStorage = chrome.storage.sync.get as jest.Mock;
    getStorage.mockImplementationOnce(
        (
            _keys: unknown,
            callback: (result: Record<string, unknown>) => void,
        ) => {
            callback({
                options: {
                    ...defaultSettings,
                    themePreference: "dark",
                },
            });
        },
    );
    let component!: ReactTestRenderer;

    act(() => {
        component = renderer.create(<Popup />);
    });

    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => {
        component.unmount();
    });
    expect(document.documentElement.dataset.theme).toBeUndefined();
});
