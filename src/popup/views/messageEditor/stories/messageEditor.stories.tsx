import React, { useState } from "react";
import { Story, Meta } from "@storybook/react";
import { MessageEditor, MessageEditorProps } from "../index";
import { SettingsType } from "@src/lib/utilities/googleStorage";

export default {
    title: "Components/MessageEditor",
    component: MessageEditor,
} as Meta;

const Template: Story<MessageEditorProps> = (args) => {
    const [liveSettings, setLiveSettings] = useState<SettingsType>({
        messageMaxWidthStyle: "",
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        textSizeUserStyle: "",
        textSizeNonUserStyle: "",
        textWeightUserStyle: "",
        textWeightNonUserStyle: "",
        messageButtonsVisibilityStyle: true,
    });
    return (
        <MessageEditor
            liveSettings={liveSettings}
            setLiveSettings={setLiveSettings}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    // userMessageColorLiveChange: (colorStyle: string) => console.log(colorStyle),
    // chatMessageColorLiveChange: (colorStyle: string) => console.log(colorStyle),
    // messageMaxWidthLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    //     console.log(e.target.value),
    // messagePaddingLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    //     console.log(e.target.value),
    // messageBorderRadiusLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    //     console.log(e.target.value),
    // inputBoxMaxWidthLiveChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    //     console.log(e.target.value),
    // setSettings: (settings: SettingsType) => {};
};
