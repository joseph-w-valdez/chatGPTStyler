import * as React from "react";
import { HomeMenu } from "../component";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer
        .create(
            <HomeMenu
                textEditorRedirect={jest.fn()}
                messageEditorRedirect={jest.fn()}
            />,
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});
