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
    settingsOptions: "Size",
    liveChanges: {
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
    setLiveChanges: action(""),
    applyUpdates: action("Apply Updates"),
};
