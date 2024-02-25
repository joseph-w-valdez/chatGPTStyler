import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { HomeButton } from "../HomeButton";

// // // //

export default {
    title: "Components/HomeButton",
    component: HomeButton,
} as ComponentMeta<typeof HomeButton>;

const Template: ComponentStory<typeof HomeButton> = (args) => (
    <HomeButton {...args} />
);

// // // //

export const Render = Template.bind({});
Render.args = {
    dataTestid: "custom-label-btn",
    onClick: () => alert("Button clicked"),
    btnLabel: "custom-label-btn",
};
