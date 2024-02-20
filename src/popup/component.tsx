import React from "react";
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";
import { Header } from "@src/components/header";
import { RenderPage } from "@src/lib/utilities/RenderPage";
import {
    OptionsTypes,
    getOptionsFromStorage,
    saveOptionsToStorage,
} from "@src/lib/utilities/googleStorage";

export function Popup(): JSX.Element {
    const [options, setOptions] = useState<OptionsTypes>({
        messageColorUserStyle: "",
        messageColorNonUserStyle: "",
        messageMaxWidthStyle: "",
        messagePaddingStyle: "",
        messageBorderRadiusStyle: "",
        inputBoxMaxWidthStyle: "",
        textColorUserStyle: "",
        textColorNonUserStyle: "",
        textSizeUserStyle: "",
        textSizeNonUserStyle: "",
        textWeightUserStyle: "",
        textWeightNonUserStyle: "",
    });

    const [page, setPage] = useState<string>("Home Page");
    // Sends the `popupMounted` event
    useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    // Load options from storage when the popup is opened
    useEffect(() => {
        getOptionsFromStorage((savedOptions) => {
            setOptions(savedOptions);
            console.log("loaded options from storage", savedOptions);
        });
    }, []);

    // Use useEffect to save options whenever they change
    // useEffect(() => {
    //     if (options) {
    //         saveOptionsToStorage(options);
    //         console.log("latest options", options);
    //     }
    // }, [options]);

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="w-full">
                <Header page={page} setPage={setPage} />
                <hr className="mb-2" />
                <RenderPage
                    setOptions={setOptions}
                    userMessageColorLiveChange={(colorStyle) =>
                        setOptions({
                            ...options,
                            messageColorUserStyle: colorStyle,
                        })
                    }
                    chatMessageColorLiveChange={(colorStyle) =>
                        setOptions({
                            ...options,
                            messageColorNonUserStyle: colorStyle,
                        })
                    }
                    messageMaxWidthLiveChange={(e) =>
                        setOptions({
                            ...options,
                            messageMaxWidthStyle: e.currentTarget.value,
                        })
                    }
                    messagePaddingLiveChange={(e) =>
                        setOptions({
                            ...options,
                            messagePaddingStyle: e.currentTarget.value,
                        })
                    }
                    messageBorderRadiusLiveChange={(e) =>
                        setOptions({
                            ...options,
                            messageBorderRadiusStyle: e.currentTarget.value,
                        })
                    }
                    inputBoxMaxWidthLiveChange={(e) =>
                        setOptions({
                            ...options,
                            inputBoxMaxWidthStyle: e.currentTarget.value,
                        })
                    }
                    userColorLiveChange={(colorStyle) =>
                        setOptions({
                            ...options,
                            textColorUserStyle: colorStyle,
                        })
                    }
                    userFontSizeOnChange={(e) =>
                        setOptions({
                            ...options,
                            textSizeUserStyle: e.currentTarget.value,
                        })
                    }
                    userFontWeightOnChange={(e) =>
                        setOptions({
                            ...options,
                            textWeightUserStyle: e.currentTarget.value,
                        })
                    }
                    chatColorLiveChange={(colorStyle) =>
                        setOptions({
                            ...options,
                            textColorNonUserStyle: colorStyle,
                        })
                    }
                    chatFontSizeOnChange={(e) =>
                        setOptions({
                            ...options,
                            textSizeNonUserStyle: e.currentTarget.value,
                        })
                    }
                    chatFontWeightOnChange={(e) =>
                        setOptions({
                            ...options,
                            textWeightNonUserStyle: e.currentTarget.value,
                        })
                    }
                    options={options}
                    page={page}
                    setPage={setPage}
                />
            </div>
        </div>
    );
}
