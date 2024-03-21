import React from "react";
import { Story, Meta } from "@storybook/react";
import { MessageSliderControls, SliderControlsProps } from "../component";

export default {
    title: "Components/MessageSliderControls",
    component: MessageSliderControls,
} as Meta;

const Template: Story<SliderControlsProps> = (args) => (
    <MessageSliderControls {...args} />
);

export const Default = Template.bind({});
Default.args = {
    setLiveChanges: () => alert("Live changes settings"),
    liveChanges: {
        messageMaxWidthStyle: "95",
        messagePaddingStyle: "10",
        messageBorderRadiusStyle: "5",
        messageColorUserStyle: "#386d9f",
        messageColorNonUserStyle: "#333333",
        messageButtonsVisibilityStyle: false,
        inputBoxMaxWidthStyle: "70",
        textColorUserStyle: "#FFFFFF",
        textColorNonUserStyle: "#FFFFFF",
    },
    setIsEditing: () => alert("is editing settings"),
};
