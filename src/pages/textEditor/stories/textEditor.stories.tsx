import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { TextEditor } from "../component";

storiesOf("TextEditor", module)
    .add("Default View", () => (
        <TextEditor
            userColorLiveChange={action("User Color Live Change")}
            userFontSizeOnChange={action("User Font Size Change")}
            userFontWeightOnChange={action("User Font Weight Change")}
            chatColorLiveChange={action("Chat Color Live Change")}
            chatFontSizeOnChange={action("Chat Font Size Change")}
            chatFontWeightOnChange={action("Chat Font Weight Change")}
        />
    ))
    .add("With Custom Props", () => (
        <TextEditor
            userColorLiveChange={action("User Color Live Change")}
            userFontSizeOnChange={action("User Font Size Change")}
            userFontWeightOnChange={action("User Font Weight Change")}
            chatColorLiveChange={action("Chat Color Live Change")}
            chatFontSizeOnChange={action("Chat Font Size Change")}
            chatFontWeightOnChange={action("Chat Font Weight Change")}
        />
    ));
