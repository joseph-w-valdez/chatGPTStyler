import React from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { TextFormControls, TextFormControlsProps } from "../component";

export default {
    title: "TextFormControls",
    component: TextFormControls,
} as Meta;

const Template: Story<TextFormControlsProps> = (args) => (
    <TextFormControls {...args} />
);

export const Default = Template.bind({});
Default.args = {
    section: "Sample Section",
    colorLiveChange: action("Color Live Change"),
    fontSizeOnChange: action("Font Size Change"),
    fontWeightOnChange: action("Font Weight Change"),
    option: {
        messageMaxWidthStyle: "",
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        textSizeUserStyle: "",
        textSizeNonUserStyle: "",
        textWeightUserStyle: "",
        textWeightNonUserStyle: "",
    },
    applyUpdates: action("Apply Updates"),
};
