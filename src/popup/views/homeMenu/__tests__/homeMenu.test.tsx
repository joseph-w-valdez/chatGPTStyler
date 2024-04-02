import * as React from "react";
import { HomeMenu } from "../component";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer.create(<HomeMenu setPage={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
});
