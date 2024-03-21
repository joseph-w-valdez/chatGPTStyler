import React from "react";
import { Story, Meta } from "@storybook/react";
import { MiscEditor, MessageEditorProps } from "../component";

export default {
    title: "Components/MiscEditor",
    component: MiscEditor,
} as Meta;

const Template: Story<MessageEditorProps> = (args) => <MiscEditor {...args} />;

export const Default = Template.bind({});
Default.args = {
    liveSettings: {
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messageMaxWidthStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        messageButtonsVisibilityStyle: true,
    },
    setLiveSettings: () => alert("live is setting"),
};
