import React from "react";
import { Meta, Story } from "@storybook/react";
import { Popup } from "../component";

export default {
    title: "Components/Popup",
    component: Popup,
} as Meta;

const Template: Story = () => <Popup />;

export const Default = Template.bind({});
Default.args = {};
