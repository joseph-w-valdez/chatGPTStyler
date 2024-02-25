import * as React from "react";
import { Header } from "../Header";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer
        .create(<Header page="string" setPage={() => {}} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
