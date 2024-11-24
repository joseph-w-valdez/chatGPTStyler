import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { MessageEditor, MessageEditorProps } from "../index";

export default {
    title: "Components/MessageEditor",
    component: MessageEditor,
} as ComponentMeta<typeof MessageEditor>;

const Template: ComponentStory<typeof MessageEditor> = (
    args: MessageEditorProps,
) => <MessageEditor {...args} />;

export const Default = Template.bind({});
Default.args = {
    liveSettings: {
        messageMaxWidthStyle: "95",
        messagePaddingStyle: "10",
        messageBorderRadiusStyle: "5",
        messageColorUserStyle: "#386d9f",
        messageColorNonUserStyle: "#333333",
        messageButtonsVisibilityStyle: false,
        inputBoxMaxWidthStyle: "94",
        textColorUserStyle: "#FFFFFF",
        textColorNonUserStyle: "#FFFFFF",
    },
    setLiveSettings: () => alert("live changes"),
};
