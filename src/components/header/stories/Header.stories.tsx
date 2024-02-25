import * as React from "react";
import { Header } from "../Header";
import { ComponentMeta } from "@storybook/react";

// // // //

export default {
    title: "Components/Header",
    component: Header,
} as ComponentMeta<typeof Header>;

export const Render = () => <Header page="string" setPage={() => {}} />;
