import * as React from "react";
import { Meta } from "@storybook/react";
import { Header } from "../Header";

export default {
    title: "Components/Header",
    component: Header,
} as Meta;

export const Render: React.FC = () => (
    <Header page="string" setPage={() => alert("clicked")} />
);
