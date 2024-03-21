import React from "react";
import { Meta, Story } from "@storybook/react";
import { FormButtons, FormButtonsProps } from "../FormButtons";

export default {
    title: "Components/FormButtons",
    component: FormButtons,
} as Meta;

const Template: Story<FormButtonsProps> = (args) => <FormButtons {...args} />;

type SettingsType = {
    messageMaxWidthStyle: string;
    messageColorUserStyle: string;
    messageColorNonUserStyle: string;
    messagePaddingStyle: string;
    messageBorderRadiusStyle: string;
    inputBoxMaxWidthStyle: string;
    textColorUserStyle: string;
    textColorNonUserStyle: string;
    messageButtonsVisibilityStyle: boolean;
};

const settings: SettingsType = {
    messageMaxWidthStyle: "",
    messageColorUserStyle: "",
    messageColorNonUserStyle: "",
    messagePaddingStyle: "",
    messageBorderRadiusStyle: "",
    inputBoxMaxWidthStyle: "",
    textColorUserStyle: "",
    textColorNonUserStyle: "",
    messageButtonsVisibilityStyle: false,
};

const initialState: {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    liveSettings: SettingsType;
    setLiveSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
    savedSettings: SettingsType;
    setSavedSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
} = {
    isEditing: false,
    setIsEditing: () => alert("is editing"),
    liveSettings: { ...settings },
    setLiveSettings: () => alert("live setting"),
    savedSettings: { ...settings },
    setSavedSettings: () => alert("saving settings"),
};

export const Default = Template.bind({});
Default.args = { ...initialState };

export const Editing = Template.bind({});
Editing.args = {
    ...initialState,
    isEditing: true,
};

export const WithSettings = Template.bind({});
WithSettings.args = {
    ...initialState,
    liveSettings: { ...settings },
    savedSettings: { ...settings },
};
