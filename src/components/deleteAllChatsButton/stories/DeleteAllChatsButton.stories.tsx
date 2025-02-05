// stories.tsx
import React from "react";
import { DeleteAllChatsButton } from "../DeleteAllChatsButton";
import { Meta, Story } from "@storybook/react";

export default {
    title: "Components/DeleteAllChatsButton",
    component: DeleteAllChatsButton,
} as Meta;

const Template: Story = (args) => <DeleteAllChatsButton {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const LoadingState = Template.bind({});
LoadingState.args = {};

export const ErrorState = Template.bind({});
ErrorState.args = {
    error: "Failed to delete all messages. Please try again.",
};
