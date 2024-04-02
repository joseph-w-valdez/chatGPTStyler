import React from "react";
import css from "./styles.module.css";
interface HeaderProps {
    page: string;
    setPage: React.Dispatch<React.SetStateAction<string>>;
}

export function Header({ page, setPage }: HeaderProps): JSX.Element {
    return (
        <div className="p-3 text-center relative">
            <h1 className="text-lg">ChatGPT Styler</h1>
            {page !== "Home" && (
                <button
                    className={`${css.btn} absolute inset-y-0 right-0 animate-fade-in m-2`}
                    onClick={() => setPage("Home")}
                >
                    Back
                </button>
            )}
        </div>
    );
}
