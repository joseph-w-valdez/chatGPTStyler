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
    section: "Sample",
    colorLiveChange: action("Color Live Change"),
    fontSizeOnChange: action("Font Size Change"),
    fontWeightOnChange: action("Font Weight Change"),
};
