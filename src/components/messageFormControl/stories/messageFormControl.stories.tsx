import React from "react";
import { Story, Meta } from "@storybook/react";
import { MessageFormControl, MessageFormControlProps } from "../index";

export default {
    title: "YourComponentGroup/MessageFormControl",
    component: MessageFormControl,
} as Meta;

const Template: Story<MessageFormControlProps> = (args) => (
    <MessageFormControl {...args} />
);

export const Example = Template.bind({});
Example.args = {
    // section: "Example Section",
    // colorLiveChange: (colorStyle: string) =>
    //     console.log(`Color style changed: ${colorStyle}`),
};
