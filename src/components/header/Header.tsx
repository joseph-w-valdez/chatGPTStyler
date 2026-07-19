import React from "react";

export function Header(): JSX.Element {
    return (
        <header className="px-3 pt-3 pb-2 bg-surface-raised">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-semibold tracking-tight text-ink">
                        ChatGPT Styler
                    </h1>
                    <img
                        src="icon-128.png"
                        alt=""
                        aria-hidden="true"
                        className="w-6 h-6"
                    />
                </div>
                <button
                    type="button"
                    aria-label="Close popup"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-ink hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={() => window.close()}
                >
                    <svg
                        aria-hidden="true"
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    >
                        <line x1="5" y1="5" x2="19" y2="19" />
                        <line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
