import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Popup } from "../component";

export default {
    title: "Components/Popup",
    component: Popup,
} as ComponentMeta<typeof Popup>;

const Template: ComponentStory<typeof Popup> = () => <Popup />;

export const Default = Template.bind({});
Default.args = {};
