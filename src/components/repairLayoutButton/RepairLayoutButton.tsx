import React, { useState } from "react";
import {
    RepairSelectorsMessage,
    RepairSelectorsResponse,
    RepairSummary,
    ResetSelectorRepairsMessage,
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

const describe = (summary: RepairSummary): string => {
    if (summary.repaired.length && !summary.stillBroken.length) {
        return `Repaired ${summary.repaired.length}: ${summary.repaired
            .map((item) => item.label)
            .join(", ")}.`;
    }
    if (summary.repaired.length) {
        return `Repaired ${
            summary.repaired.length
        }; still broken: ${summary.stillBroken.join(", ")}.`;
    }
    if (summary.stillBroken.length) {
        return `Couldn't repair: ${summary.stillBroken.join(
            ", ",
        )}. Try Audit on page.`;
    }
    return "Everything already works. Nothing needed repair.";
};

/**
 * Dev-only: asks the ChatGPT tab to find replacements for selectors broken by
 * a ChatGPT update and apply them in this browser, so you can confirm a fix
 * before promoting it into the registry. Repairs can be undone.
 */
export function RepairLayoutButton(): JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<RepairSummary | null>(null);
    const [lastAction, setLastAction] = useState<
        RepairSelectorsMessage["action"] | ResetSelectorRepairsMessage["action"]
    >("repairSelectors");

    const send = (
        message: RepairSelectorsMessage | ResetSelectorRepairsMessage,
    ): void => {
        setIsLoading(true);
        setError(null);
        setLastAction(message.action);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                setIsLoading(false);
                setError("Open a ChatGPT conversation first.");
                return;
            }

            chrome.tabs.sendMessage(
                tab.id,
                message,
                (response: RepairSelectorsResponse | undefined) => {
                    setIsLoading(false);

                    if (chrome.runtime.lastError) {
                        setError(
                            chrome.runtime.lastError.message ||
                                "Failed to reach the ChatGPT tab",
                        );
                        return;
                    }

                    if (response?.status === "SUCCESS") {
                        setSummary(response.summary);
                        return;
                    }

                    setError(response?.message || "Layout repair failed");
                },
            );
        });
    };

    return (
        <div className="grid gap-2 rounded-lg border border-edge bg-surface-elevated p-3 text-sm text-ink">
            <div className="grid gap-1">
                <span className="font-medium">Repair layout</span>
                <span className="text-xs text-ink-muted">
                    Finds replacements for broken selectors and applies them in
                    this browser only. Use Repair &amp; export to get the patch
                    for a new build.
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium rounded-md bg-accent text-accent-contrast hover:opacity-90 disabled:opacity-40"
                    disabled={isLoading}
                    onClick={() => send({ action: "repairSelectors" })}
                >
                    {isLoading ? "Checking…" : "Repair layout"}
                </button>
                <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium rounded-md border border-edge bg-surface text-ink hover:bg-surface-raised disabled:opacity-40"
                    disabled={isLoading}
                    onClick={() => send({ action: "resetSelectorRepairs" })}
                >
                    Undo repairs
                </button>
            </div>
            {error || summary ? (
                <p
                    role="status"
                    aria-live="polite"
                    className={`text-xs ${
                        error ? "text-danger" : "text-ink-muted"
                    }`}
                >
                    {error ||
                        (lastAction === "resetSelectorRepairs"
                            ? "Repairs removed; using the built-in selectors."
                            : summary && describe(summary))}
                </p>
            ) : null}
        </div>
    );
}
