import * as React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";
import "../css/app.css";

const mountPopup = (): void => {
    const root = document.getElementById("popup");
    if (!root) {
        console.error("Popup root #popup was not found");
        return;
    }
    createRoot(root).render(<Popup />);
};

// popup.html historically loads js/popup.js in <head>, so wait for the body root.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPopup);
} else {
    mountPopup();
}
