import React from "react";
import { Story, Meta } from "@storybook/react";
import { MessageFormControl, MessageFormControlProps } from "../index";
import { SettingsType } from "@src/lib/utilities/googleStorage";

export default {
    title: "YourComponentGroup/MessageFormControl",
    component: MessageFormControl,
} as Meta;

const Template: Story<MessageFormControlProps> = (args) => (
    <MessageFormControl {...args} />
);

export const Example = Template.bind({});
Example.args = {
    settingsOptions: "message",
};
