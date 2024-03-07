import * as React from "react";
import { HomeButton } from "../HomeButton";
import renderer from "react-test-renderer";

it("component renders", () => {
    const dataTestid = "test-id";
    const btnLabel = "click me uWu";

    expect(typeof dataTestid).toBe("string");
    expect(typeof btnLabel).toBe("string");

    const tree = renderer
        .create(
            <HomeButton
                dataTestid={dataTestid}
                onClick={jest.fn()}
                btnLabel={btnLabel}
            />,
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});
