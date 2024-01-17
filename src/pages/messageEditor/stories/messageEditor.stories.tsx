import React from "react";
import { Story, Meta } from "@storybook/react";
import { MessageEditor, MessageEditorProps } from "../index";

export default {
    title: "Components/MessageEditor",
    component: MessageEditor,
} as Meta;

const Template: Story<MessageEditorProps> = (args) => (
    <MessageEditor {...args} />
);

export const Default = Template.bind({});
Default.args = {
    userMessageColorLiveChange: (colorStyle: string) => console.log(colorStyle),
    chatMessageColorLiveChange: (colorStyle: string) => console.log(colorStyle),
    messageMaxWidthLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        console.log(e.target.value),
    messagePaddingLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        console.log(e.target.value),
    messageBorderRadiusLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        console.log(e.target.value),
    inputBoxMaxWidthLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        console.log(e.target.value),
};
