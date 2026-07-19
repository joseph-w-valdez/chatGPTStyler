import React from "react";
import renderer from "react-test-renderer";
import { FormButtons } from "../FormButtons";
import { defaultSettings } from "@src/shared/settings";

const mockFunction = jest.fn();
const settings = { ...defaultSettings };

describe("FormButtons", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(
                <FormButtons
                    isEditing={false}
                    setIsEditing={mockFunction}
                    liveSettings={settings}
                    setLiveSettings={mockFunction}
                    savedSettings={settings}
                    setSavedSettings={mockFunction}
                    onRestoreDefaults={mockFunction}
                />,
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
