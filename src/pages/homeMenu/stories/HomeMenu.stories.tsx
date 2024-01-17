import React from "react";
import { HomeMenu } from "../component"; // Update the path accordingly
import { ComponentStory, ComponentMeta } from "@storybook/react";

// // // //

export default {
    title: "Components/HomeMenu",
    component: HomeMenu,
} as ComponentMeta<typeof HomeMenu>;

const Template: ComponentStory<typeof HomeMenu> = (args) => (
    <HomeMenu {...args} />
);

// // // //

export const Render = Template.bind({});
Render.args = {
    textEditorRedirect: () => alert("Redirecting"),
    messageEditorRedirect: () => alert("Redirecting"),
};
