import React from "react";
import { Meta, Story } from "@storybook/react";
import { HomeMenu, HomeMenuProps } from "../component";

export default {
    title: "Components/HomeMenu",
    component: HomeMenu,
} as Meta;

const Template: Story<HomeMenuProps> = (args) => <HomeMenu {...args} />;

export const Render = Template.bind({});
Render.args = {
    setPage: () => alert("Redirecting"),
};
