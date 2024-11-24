import React from "react";
import { Meta, Story } from "@storybook/react";
import { ColorControls, ColorControlsProps } from "../component";

export default {
    title: "Components/ColorControls",
    component: ColorControls,
} as Meta;

const Template: Story<ColorControlsProps> = (args) => (
    <ColorControls {...args} />
);

export const Default = Template.bind({});
Default.args = {
    setLiveChanges: () => alert("seting live changes"),
    liveChanges: {
        messageMaxWidthStyle: "95",
        messagePaddingStyle: "10",
        messageBorderRadiusStyle: "5",
        messageColorUserStyle: "#386d9f",
        messageColorNonUserStyle: "#333333",
        messageButtonsVisibilityStyle: false,
        inputBoxMaxWidthStyle: "94",
        textColorUserStyle: "#FFFFFF",
        textColorNonUserStyle: "#FFFFFF",
    },
    setIsEditing: () => alert("is editing is set"),
};
