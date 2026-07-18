import * as React from "react";
import * as ReactDOM from "react-dom";
import { Popup } from "./component";
import "../css/app.css";

const mountPopup = (): void => {
    const root = document.getElementById("popup");
    if (!root) {
        console.error("Popup root #popup was not found");
        return;
    }
    ReactDOM.render(<Popup />, root);
};

// popup.html historically loads js/popup.js in <head>, so wait for the body root.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPopup);
} else {
    mountPopup();
}
