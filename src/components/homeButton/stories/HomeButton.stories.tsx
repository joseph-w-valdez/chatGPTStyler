import React from "react";
import { Meta, Story } from "@storybook/react";
import { HomeButton, HomeButtonProps } from "../HomeButton";

export default {
    title: "Components/HomeButton",
    component: HomeButton,
} as Meta;

const Template: Story<HomeButtonProps> = (args) => <HomeButton {...args} />;

export const Render = Template.bind({});
Render.args = {
    dataTestid: "custom-label-btn",
    onClick: () => alert("Button clicked"),
    btnLabel: "custom-label-btn",
};
