import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { TextEditor } from "../component";

const defaultOptions = {
    textColorUserStyle: "000000",
    textColorNonUserStyle: "000000",
    messageMaxWidthStyle: "100%",
    messageColorUserStyle: "000000",
    messageColorNonUserStyle: "000000",
    messagePaddingStyle: "12%",
    messageBorderRadiusStyle: "15%",
    inputBoxMaxWidthStyle: "51",
    textSizeUserStyle: "23",
    textSizeNonUserStyle: "13",
    textWeightUserStyle: "100",
    textWeightNonUserStyle: "100",
};

storiesOf("TextEditor", module)
    .add("Default View", () => (
        <TextEditor
            settings={defaultOptions}
            setOptions={action("Set Options")}
        />
    ))
    .add("With Custom Props", () => (
        <TextEditor
            settings={defaultOptions}
            setOptions={action("Set Options")}
        />
    ));
