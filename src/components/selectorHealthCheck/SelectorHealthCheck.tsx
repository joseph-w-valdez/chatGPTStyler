import React, { useState } from "react";
import {
    ExportWorkingSelectorsMessage,
    ExportWorkingSelectorsResponse,
    WorkingSelectorsExport,
    OpenSelectorInspectorMessage,
    SelectorInspectorMode,
} from "@src/shared/messaging";
import { RepairLayoutButton } from "@src/components/repairLayoutButton";

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
 * Dev-only selector tools: Repair, Repair & export, and the on-page inspector.
 * Mount only behind `process.env.NODE_ENV === "development"` (see MessageEditor).
 */
export function SelectorHealthCheck(): JSX.Element | null {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exported, setExported] = useState<WorkingSelectorsExport | null>(
        null,
    );
    const [exportCopied, setExportCopied] = useState(false);

    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const exportJson = exported ? JSON.stringify(exported, null, 2) : "";

    const copyExport = (json: string): void => {
        void navigator.clipboard
            .writeText(json)
            .then(() => setExportCopied(true))
            .catch(() => setExportCopied(false));
    };

    const runRepairExport = (): void => {
        setIsLoading(true);
        setError(null);
        setExported(null);
        setExportCopied(false);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                setIsLoading(false);
                setError("Active tab is not ChatGPT");
                return;
            }

            const message: ExportWorkingSelectorsMessage = {
                action: "exportWorkingSelectors",
            };

            chrome.tabs.sendMessage(
                tab.id,
                message,
                (response: ExportWorkingSelectorsResponse | undefined) => {
                    setIsLoading(false);

                    if (chrome.runtime.lastError) {
                        setError(
                            chrome.runtime.lastError.message ||
                                "Failed to reach the ChatGPT tab",
                        );
                        return;
                    }

                    if (response?.status === "SUCCESS") {
                        setExported(response.export);
                        copyExport(JSON.stringify(response.export, null, 2));
                        return;
                    }

                    setError(response?.message || "Selector export failed");
                },
            );
        });
    };

    const openInspector = (mode: SelectorInspectorMode): void => {
        setError(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !isChatGptUrl(tab.url)) {
                setError("Active tab is not ChatGPT");
                return;
            }

            const message: OpenSelectorInspectorMessage = {
                action: "openSelectorInspector",
                mode,
            };

            chrome.tabs.sendMessage(tab.id, message, () => {
                if (chrome.runtime.lastError) {
                    setError(
                        chrome.runtime.lastError.message ||
                            "Failed to reach the ChatGPT tab",
                    );
                    return;
                }
                // The inspector lives on the page; close so the next click lands there.
                window.close();
            });
        });
    };

    return (
        <div className="grid gap-2 border border-dashed border-edge rounded-md p-2 bg-surface-elevated">
            <RepairLayoutButton />
            <button
                type="button"
                className="w-full px-3 py-2 text-sm font-medium text-accent-contrast bg-accent rounded-md hover:opacity-90 disabled:opacity-40"
                disabled={isLoading}
                onClick={runRepairExport}
            >
                {isLoading ? "Repairing…" : "Repair & export selectors"}
            </button>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium text-ink bg-surface border border-edge rounded-md hover:bg-surface-raised"
                    onClick={() => openInspector("audit")}
                >
                    Audit on page
                </button>
                <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium text-ink bg-surface border border-edge rounded-md hover:bg-surface-raised"
                    onClick={() => openInspector("pick")}
                >
                    Pick element
                </button>
            </div>
            {exported && (
                <div className="text-xs text-ink grid gap-1">
                    <p className="font-medium text-ink-muted">
                        {exported.summary.working.length} working ·{" "}
                        {exported.summary.repaired.length} repaired ·{" "}
                        {exported.summary.needsReview.length} to review ·{" "}
                        {exported.summary.broken.length} broken ·{" "}
                        {Object.keys(exported.registryPatch).length} to promote
                    </p>
                    {exported.summary.broken.length ? (
                        <p className="text-danger">
                            Broken: {exported.summary.broken.join(", ")}
                        </p>
                    ) : null}
                    {exported.summary.needsReview.length ? (
                        <p className="text-ink-muted">
                            Review: {exported.summary.needsReview.join(", ")}
                        </p>
                    ) : null}
                    <textarea
                        readOnly
                        aria-label="Working selectors JSON"
                        className="w-full h-32 p-1 font-mono text-[10px] text-ink bg-surface border border-edge rounded-md"
                        value={exportJson}
                    />
                    <button
                        type="button"
                        className="w-full px-3 py-2 text-sm font-medium text-ink bg-surface border border-edge rounded-md hover:bg-surface-raised"
                        onClick={() => copyExport(exportJson)}
                    >
                        {exportCopied ? "Copied!" : "Copy JSON"}
                    </button>
                </div>
            )}
            {error && (
                <p role="status" className="text-sm text-danger text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
