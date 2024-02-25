import React from "react";
import { Story, Meta } from "@storybook/react";
import { ColorControls, ColorControlsProps } from "../ColorControls";

export default {
    title: "YourComponentGroup/MessageFormControl",
    component: ColorControls,
} as Meta;

const Template: Story<ColorControlsProps> = (args) => (
    <ColorControls {...args} />
);

export const Example = Template.bind({});
Example.args = {
    // section: "Example Section",
    // colorLiveChange: (colorStyle: string) =>
    //     console.log(`Color style changed: ${colorStyle}`),
};
