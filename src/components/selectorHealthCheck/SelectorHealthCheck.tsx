import React, { useState } from "react";
import {
    CheckSelectorsMessage,
    CheckSelectorsResponse,
    SelectorCheckReport,
} from "@src/shared/messaging";

const isChatGptUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com");
    } catch {
        return false;
    }
};

/**
 * Dev-only control that asks the content script to probe ChatGPT DOM selectors.
 * Mount only behind `process.env.NODE_ENV === "development"` (see MessageEditor).
 */
export function SelectorHealthCheck(): JSX.Element | null {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<SelectorCheckReport | null>(null);
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const runCheck = (): void => {
        setIsLoading(true);
        setError(null);
        setReport(null);
        setCopyStatus("idle");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                setIsLoading(false);
                setError("Active tab is not ChatGPT");
                return;
            }

            const message: CheckSelectorsMessage = {
                action: "checkSelectors",
            };

            chrome.tabs.sendMessage(
                tab.id,
                message,
                (response: CheckSelectorsResponse | undefined) => {
                    setIsLoading(false);

                    if (chrome.runtime.lastError) {
                        setError(
                            chrome.runtime.lastError.message ||
                                "Failed to reach the ChatGPT tab",
                        );
                        return;
                    }

                    if (response?.status === "SUCCESS") {
                        setReport(response.report);
                        return;
                    }

                    setError(response?.message || "Selector check failed");
                },
            );
        });
    };

    const copyResults = async (): Promise<void> => {
        if (!report) return;

        try {
            await navigator.clipboard.writeText(
                JSON.stringify(report, null, 2),
            );
            setCopyStatus("copied");
        } catch {
            setError("Could not copy selector results");
        }
    };

    return (
        <div className="grid gap-2 border border-dashed border-edge rounded-md p-2 bg-surface-raised">
            <button
                type="button"
                className="w-full px-3 py-2 text-sm font-medium text-accent-contrast bg-accent rounded-md hover:opacity-90 disabled:opacity-40"
                disabled={isLoading}
                onClick={runCheck}
            >
                {isLoading ? "Checking selectors…" : "Check ChatGPT Selectors"}
            </button>
            {error && (
                <p role="status" className="text-sm text-danger text-center">
                    {error}
                </p>
            )}
            {report && (
                <div className="text-xs text-ink grid gap-1">
                    <p className="font-medium text-ink-muted">
                        Required {report.requiredOk} ok / {report.requiredFail}{" "}
                        fail · optional present {report.optionalPresent}
                    </p>
                    <ul className="grid gap-0.5 max-h-40 overflow-y-auto">
                        {report.items.map((item) => (
                            <li key={item.id}>
                                {item.ok ? "✓" : "✗"} {item.label}: {item.count}
                                {item.optional ? " (optional)" : ""}
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        className="w-full mt-1 px-3 py-2 text-sm font-medium text-ink bg-surface border border-edge rounded-md hover:bg-surface-raised"
                        onClick={copyResults}
                    >
                        {copyStatus === "copied" ? "Copied!" : "Copy Results"}
                    </button>
                </div>
            )}
        </div>
    );
}
