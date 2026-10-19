import React, { useEffect, useMemo, useRef, useState } from "react";
import { SelectorInspectorMode } from "@src/shared/messaging";
import { Settings } from "@src/shared/settings";
import {
    DEFAULT_SELECTORS,
    getSelectorDefinition,
    SELECTOR_DEFINITIONS,
    SelectorKey,
} from "@src/shared/selectors";
import {
    getActiveSelector,
    getSelectorOverrides,
    getSimulatedBreaks,
    onActiveSelectorsChange,
    SelectorOverrides,
    setSelectorOverrides,
    setSimulatedBreaks,
} from "@src/lib/utilities/activeSelectors";
import { repairSelectors } from "@src/lib/utilities/selectorRepair";
import { exportWorkingSelectors } from "@src/lib/utilities/selectorExport";
import {
    buildSelectorCandidates,
    describeElement,
    describeElementShort,
    discoverSelectors,
    DiscoveryReport,
    DiscoveryTarget,
    findTargetElements,
    getAncestors,
    matchProbes,
    RankedCandidate,
    SelectorCandidate,
    TargetElements,
} from "@src/lib/utilities/selectorDiscovery";
import {
    hasEffectCheck,
    SelectorTestResult,
    SelectorTestStatus,
    testSelector,
} from "@src/lib/utilities/selectorTesting";
import {
    captureEnvironment,
    formatElementReport,
    formatWorkbenchReport,
} from "@src/lib/utilities/selectorReport";

type View = "picking" | "element" | "audit";
type Box = { top: number; left: number; width: number; height: number };
type Hover = { box: Box; label: string };
type Drafts = Partial<Record<SelectorKey, string>>;
type Results = Partial<Record<SelectorKey, SelectorTestResult>>;

export interface SelectorInspectorProps {
    mode: SelectorInspectorMode;
    /** Increments on every open request so re-opening re-applies `mode`. */
    requestId: number;
    host: HTMLElement;
    getSettings: () => Settings | null;
    onClose: () => void;
}

const MAX_HIGHLIGHTS = 60;
const HIGHLIGHT_MS = 3000;

// Pointer events ChatGPT (and Radix menus) act on before `click` fires.
const BLOCKED_PICK_EVENTS = [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "auxclick",
    "dblclick",
    "contextmenu",
];

const toBox = (el: Element): Box => {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
};

const boxStyle = (box: Box): React.CSSProperties => ({
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
});

const statusIcon = (status?: SelectorTestStatus): string =>
    status === "pass"
        ? "✓"
        : status === "warn"
        ? "!"
        : status === "fail"
        ? "✗"
        : "·";

const statusClass = (status?: SelectorTestStatus | "skipped"): string =>
    status === "pass"
        ? "ok"
        : status === "warn"
        ? "warn"
        : status === "fail"
        ? "bad"
        : "muted";

const copyText = async (text: string, host: HTMLElement): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const root = host.shadowRoot;
        if (!root) return false;
        const textarea = document.createElement("textarea");
        textarea.value = text;
        root.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        return copied;
    }
};

/**
 * Dev-only on-page tool: click any ChatGPT element to get ranked selector
 * candidates, or open the workbench to test, apply, and auto-fix the
 * extension's selectors against the live page.
 */
export function SelectorInspector({
    mode,
    requestId,
    host,
    getSettings,
    onClose,
}: SelectorInspectorProps): JSX.Element {
    const [view, setView] = useState<View>(
        mode === "pick" ? "picking" : "audit",
    );
    const [picked, setPicked] = useState<Element | null>(null);
    const [report, setReport] = useState<DiscoveryReport | null>(null);
    const [results, setResults] = useState<Results>({});
    const [drafts, setDrafts] = useState<Drafts>({});
    const [overrides, setOverrides] = useState<SelectorOverrides>(
        getSelectorOverrides(),
    );
    const [breaks, setBreaks] = useState<SelectorKey[]>(getSimulatedBreaks());
    const [pickTarget, setPickTarget] = useState<SelectorKey | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [hover, setHover] = useState<Hover | null>(null);
    const [highlights, setHighlights] = useState<Box[]>([]);
    const [dock, setDock] = useState<"right" | "left">("right");
    const [flash, setFlash] = useState<string | null>(null);
    const [analysisKey, setAnalysisKey] = useState(0);
    const foundRef = useRef<TargetElements>(new Map());

    const showMatches = (selector: string): void => {
        let matched: Element[] = [];
        try {
            matched = Array.from(document.querySelectorAll(selector));
        } catch {
            matched = [];
        }
        setHighlights(
            matched
                .slice(0, MAX_HIGHLIGHTS)
                .map(toBox)
                .filter((box) => box.width > 0 || box.height > 0),
        );
    };

    const evaluate = (
        key: SelectorKey,
        selector: string,
        found: TargetElements = foundRef.current,
    ): SelectorTestResult =>
        testSelector({
            definition: getSelectorDefinition(key),
            selector,
            found: found.get(key) || [],
            settings: getSettings(),
            active: selector.trim() === getActiveSelector(key),
        });

    const testAll = (found: TargetElements): Results => {
        const next: Results = {};
        SELECTOR_DEFINITIONS.forEach(({ key }) => {
            next[key] = evaluate(key, getActiveSelector(key), found);
        });
        return next;
    };

    const runAudit = (): void => {
        const found = findTargetElements(document);
        foundRef.current = found;
        setReport(discoverSelectors(document, found));
        setResults(testAll(found));
        setDrafts((previous) => {
            const next: Drafts = {};
            SELECTOR_DEFINITIONS.forEach(({ key }) => {
                next[key] = previous[key] ?? getActiveSelector(key);
            });
            return next;
        });
        setPickTarget(null);
        setView("audit");
    };

    const startPicking = (target: SelectorKey | null = null): void => {
        setHighlights([]);
        setPickTarget(target);
        setView("picking");
    };

    const check = (
        key: SelectorKey,
        selector: string = drafts[key] ?? getActiveSelector(key),
    ): void => {
        const result = evaluate(key, selector);
        setResults((previous) => ({ ...previous, [key]: result }));
        if (result.valid) showMatches(result.selector);
    };

    const apply = (key: SelectorKey): void => {
        const selector = (drafts[key] ?? getActiveSelector(key)).trim();
        setSelectorOverrides({ ...getSelectorOverrides(), [key]: selector });
        setDrafts((previous) => ({ ...previous, [key]: selector }));
        check(key, selector);
    };

    const reset = (key: SelectorKey): void => {
        const next = getSelectorOverrides();
        delete next[key];
        setSelectorOverrides(next);
        setDrafts((previous) => ({
            ...previous,
            [key]: DEFAULT_SELECTORS[key],
        }));
        check(key, DEFAULT_SELECTORS[key]);
    };

    // Overrides persist across reloads, so an old manual pick can
    // silently shadow built-in selectors that now work better.
    const staleOverrides = useMemo(
        () =>
            (Object.keys(overrides) as SelectorKey[]).filter((key) => {
                const active = results[key];
                if (!active || active.status === "pass") return false;
                return evaluate(key, DEFAULT_SELECTORS[key]).status === "pass";
            }),
        [overrides, results],
    );

    const resetStale = (): void => {
        const next = getSelectorOverrides();
        staleOverrides.forEach((key) => delete next[key]);
        setSelectorOverrides(next);
        setDrafts((previous) => {
            const updated = { ...previous };
            staleOverrides.forEach((key) => {
                updated[key] = DEFAULT_SELECTORS[key];
            });
            return updated;
        });
        setResults(testAll(foundRef.current));
        setNotice(
            `Reset ${staleOverrides.length} override${
                staleOverrides.length === 1 ? "" : "s"
            }; the built-in selectors are back in use.`,
        );
    };

    const refreshAfterSelectorChange = (): void => {
        setDrafts((previous) => {
            const next: Drafts = { ...previous };
            SELECTOR_DEFINITIONS.forEach(({ key }) => {
                next[key] = getActiveSelector(key);
            });
            return next;
        });
        setResults(testAll(foundRef.current));
    };

    const toggleBreak = (key: SelectorKey): void => {
        const current = getSimulatedBreaks();
        setSimulatedBreaks(
            current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key],
        );
        refreshAfterSelectorChange();
    };

    const breakAll = (): void => {
        setSimulatedBreaks(
            SELECTOR_DEFINITIONS.map((definition) => definition.key),
        );
        refreshAfterSelectorChange();
        setNotice(
            "Every built-in selector now matches nothing. Click Run Repair.",
        );
    };

    const unbreakAll = (): void => {
        setSimulatedBreaks([]);
        refreshAfterSelectorChange();
        setNotice("Simulated breaks cleared; built-in selectors restored.");
    };

    const overrideWarning = (): string =>
        Object.keys(getSelectorOverrides()).length
            ? " Overridden selectors were skipped; reset them for a clean drill."
            : "";

    const runRepair = (): void => {
        const summary = repairSelectors({ settings: getSettings() });
        refreshAfterSelectorChange();
        setNotice(
            `Repair: ${summary.repaired.length} repaired${
                summary.repaired.length
                    ? ` (${summary.repaired
                          .map((item) => item.label)
                          .join(", ")})`
                    : ""
            }, ${summary.stillBroken.length} still broken${
                summary.stillBroken.length
                    ? ` (${summary.stillBroken.join(", ")})`
                    : ""
            }, ${summary.healthy} already fine.${overrideWarning()}`,
        );
    };

    const repairAndExport = (): void => {
        const output = exportWorkingSelectors({ settings: getSettings() });
        refreshAfterSelectorChange();
        copy(JSON.stringify(output, null, 2), "export");
        setNotice(
            `Exported: ${output.summary.working.length} working, ${
                output.summary.repaired.length
            } repaired, ${output.summary.broken.length} broken, ${
                Object.keys(output.registryPatch).length
            } to promote.${overrideWarning()}`,
        );
    };

    const resetAll = (): void => {
        setSelectorOverrides({});
        setDrafts({ ...DEFAULT_SELECTORS });
        setResults(testAll(foundRef.current));
        setNotice(
            "All overrides cleared; the extension is back on its defaults.",
        );
    };

    useEffect(() => {
        if (mode === "pick") startPicking();
        else runAudit();
    }, [mode, requestId]);

    useEffect(
        () =>
            onActiveSelectorsChange(() => {
                setOverrides(getSelectorOverrides());
                setBreaks(getSimulatedBreaks());
            }),
        [],
    );

    useEffect(() => {
        if (view !== "picking") return undefined;

        const isInsideInspector = (event: Event): boolean =>
            event.composedPath().includes(host);

        const block = (event: Event): void => {
            if (isInsideInspector(event)) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };

        const handleMove = (event: MouseEvent): void => {
            if (
                isInsideInspector(event) ||
                !(event.target instanceof Element)
            ) {
                setHover(null);
                return;
            }
            setHover({
                box: toBox(event.target),
                label: describeElementShort(event.target),
            });
        };

        const handleClick = (event: MouseEvent): void => {
            if (isInsideInspector(event)) return;
            block(event);
            if (event.target instanceof Element) {
                setPicked(event.target);
                setAnalysisKey((key) => key + 1);
                setHover(null);
                setView("element");
            }
        };

        const handleKey = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            block(event);
            setHover(null);
            if (pickTarget) {
                setPickTarget(null);
                setView("audit");
            } else if (picked) setView("element");
            else if (report) setView("audit");
            else onClose();
        };

        const previousCursor = document.documentElement.style.cursor;
        document.documentElement.style.cursor = "crosshair";
        window.addEventListener("mousemove", handleMove, true);
        window.addEventListener("click", handleClick, true);
        window.addEventListener("keydown", handleKey, true);
        BLOCKED_PICK_EVENTS.forEach((type) =>
            window.addEventListener(type, block, true),
        );

        return () => {
            document.documentElement.style.cursor = previousCursor;
            window.removeEventListener("mousemove", handleMove, true);
            window.removeEventListener("click", handleClick, true);
            window.removeEventListener("keydown", handleKey, true);
            BLOCKED_PICK_EVENTS.forEach((type) =>
                window.removeEventListener(type, block, true),
            );
        };
    }, [view, host, picked, report, pickTarget, onClose]);

    useEffect(() => {
        if (!highlights.length) return undefined;
        const clear = (): void => setHighlights([]);
        const timer = window.setTimeout(clear, HIGHLIGHT_MS);
        // Boxes are viewport snapshots, so any page scroll invalidates them.
        window.addEventListener("scroll", clear, true);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("scroll", clear, true);
        };
    }, [highlights]);

    const details = useMemo(() => {
        if (!picked) return null;
        return {
            connected: picked.isConnected,
            summary: describeElement(picked),
            candidates: buildSelectorCandidates(picked, document).slice(0, 10),
            probes: matchProbes(picked),
            ancestors: getAncestors(picked).reverse(),
        };
    }, [picked, analysisKey]);

    const flashOnce = (key: string): void => {
        setFlash(key);
        window.setTimeout(
            () => setFlash((current) => (current === key ? null : current)),
            1500,
        );
    };

    const copy = (text: string, key: string): void => {
        void copyText(text, host).then((copied) => {
            if (copied) flashOnce(key);
        });
    };

    /** Re-runs the audit so a shared report never reflects a stale page. */
    const freshAudit = (): { report: DiscoveryReport; results: Results } => {
        const found = findTargetElements(document);
        foundRef.current = found;
        const nextReport = discoverSelectors(document, found);
        const nextResults = testAll(found);
        setReport(nextReport);
        setResults(nextResults);
        return { report: nextReport, results: nextResults };
    };

    const copyReport = (): void => {
        const environment = captureEnvironment(document);

        if (view === "element" && details) {
            copy(
                formatElementReport({
                    summary: details.summary,
                    ancestors: details.ancestors.map(describeElementShort),
                    probes: details.probes,
                    candidates: details.candidates,
                    pickTarget,
                    environment,
                }),
                "report",
            );
            return;
        }

        const fresh = freshAudit();
        copy(
            formatWorkbenchReport({
                ...fresh,
                overrides: getSelectorOverrides(),
                environment,
            }),
            "report",
        );
    };

    const saveJson = (): void => {
        const environment = captureEnvironment(document);
        const fresh = freshAudit();
        const json = JSON.stringify(
            {
                ...fresh.report,
                href: environment.page,
                environment,
                results: fresh.results,
                overrides: getSelectorOverrides(),
            },
            null,
            2,
        );

        const url = URL.createObjectURL(
            new Blob([json], { type: "application/json" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `chatgpt-styler-selectors-${environment.capturedAt.replace(
            /[:.]/g,
            "-",
        )}.json`;
        host.shadowRoot?.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const renderCandidate = (
        candidate: SelectorCandidate | RankedCandidate,
        key: string,
        options: { foundElements?: number; onUse?: () => void } = {},
    ): JSX.Element => (
        <li className="row" key={key}>
            <code>{candidate.selector}</code>
            <div className="row-meta">
                <span className="badge">{candidate.kind}</span>
                <span className="badge" title="Matches in the whole page">
                    ×{candidate.count}
                </span>
                {"coverage" in candidate && options.foundElements ? (
                    <span
                        className="badge"
                        title="Heuristic target elements this selector matches"
                    >
                        covers {candidate.coverage}/{options.foundElements}
                    </span>
                ) : null}
                <span className="badge" title="Stability score">
                    {candidate.score}
                </span>
                <span className="spacer" />
                <button
                    type="button"
                    onClick={() => showMatches(candidate.selector)}
                >
                    Show
                </button>
                {options.onUse ? (
                    <button
                        type="button"
                        className="primary"
                        onClick={options.onUse}
                    >
                        Use
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => copy(candidate.selector, key)}
                    >
                        {flash === key ? "Copied" : "Copy"}
                    </button>
                )}
            </div>
        </li>
    );

    const chooseForPickTarget = (selector: string): void => {
        if (!pickTarget) return;
        const key = pickTarget;
        setDrafts((previous) => ({ ...previous, [key]: selector }));
        setPickTarget(null);
        setView("audit");
        check(key, selector);
    };

    const renderElementView = (): JSX.Element | null => {
        if (!picked || !details) return null;
        const targetLabel = pickTarget
            ? getSelectorDefinition(pickTarget).label
            : null;

        return (
            <>
                {targetLabel ? (
                    <div className="notice row-meta">
                        <span>
                            Choosing a selector for{" "}
                            <strong>{targetLabel}</strong>. Click Use on a
                            candidate, or a breadcrumb to go up.
                        </span>
                        <span className="spacer" />
                        <button
                            type="button"
                            onClick={() => {
                                setPickTarget(null);
                                setView("audit");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : null}

                <section>
                    <h3>Element</h3>
                    <div className="crumbs">
                        {[...details.ancestors, picked].map((el, index) => (
                            <button
                                type="button"
                                key={`${index}-${describeElementShort(el)}`}
                                className={`crumb${
                                    el === picked ? " current" : ""
                                }`}
                                title="Inspect this element"
                                onClick={() => {
                                    setPicked(el);
                                    setAnalysisKey((value) => value + 1);
                                }}
                                onMouseEnter={() =>
                                    setHover({
                                        box: toBox(el),
                                        label: describeElementShort(el),
                                    })
                                }
                                onMouseLeave={() => setHover(null)}
                            >
                                {describeElementShort(el)}
                            </button>
                        ))}
                    </div>
                    {!details.connected ? (
                        <p className="warn">
                            This element was removed when ChatGPT re-rendered.
                            Pick it again.
                        </p>
                    ) : null}
                </section>

                <section>
                    <h3>Used by the extension</h3>
                    {details.probes.length ? (
                        <ul>
                            {details.probes.map((probe) => (
                                <li className="row" key={probe.id}>
                                    <span>
                                        {probe.label}{" "}
                                        <span className="muted">
                                            ({probe.relation})
                                        </span>
                                    </span>
                                    <code>{probe.selector}</code>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="muted">
                            No current extension selector touches this element.
                        </p>
                    )}
                </section>

                <section>
                    <h3>Selector candidates</h3>
                    {details.candidates.length ? (
                        <ul>
                            {details.candidates.map((candidate, index) =>
                                renderCandidate(candidate, `pick-${index}`, {
                                    onUse: pickTarget
                                        ? () =>
                                              chooseForPickTarget(
                                                  candidate.selector,
                                              )
                                        : undefined,
                                }),
                            )}
                        </ul>
                    ) : (
                        <p className="muted">
                            No stable attributes here. Try a parent in the
                            breadcrumb above.
                        </p>
                    )}
                </section>

                <details>
                    <summary>Attributes &amp; classes</summary>
                    <table>
                        <tbody>
                            {details.summary.attributes.map((attr) => (
                                <tr key={attr.name}>
                                    <td>{attr.name}</td>
                                    <td className="mono">{attr.value}</td>
                                </tr>
                            ))}
                            {details.summary.inlineCustomProperties.map(
                                (prop) => (
                                    <tr key={prop.name}>
                                        <td>{prop.name}</td>
                                        <td className="mono">{prop.value}</td>
                                    </tr>
                                ),
                            )}
                            <tr>
                                <td>class</td>
                                <td className="mono">
                                    {details.summary.classes.join(" ") || "—"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </details>
            </>
        );
    };

    const renderResult = (
        key: SelectorKey,
        result: SelectorTestResult,
    ): JSX.Element => (
        <div className={`result ${result.status}`}>
            <div>
                <span className={statusClass(result.status)}>
                    {statusIcon(result.status)}
                </span>{" "}
                {result.valid
                    ? `${result.count} match${result.count === 1 ? "" : "es"}`
                    : "Invalid selector"}
                {result.valid && result.foundElements
                    ? ` · covers ${result.coverage}/${result.foundElements} heuristic matches`
                    : ""}
            </div>
            {result.effect ? (
                <div>
                    Live effect:{" "}
                    <span className={statusClass(result.effect.status)}>
                        {result.effect.detail}
                    </span>
                </div>
            ) : hasEffectCheck(key) &&
              result.valid &&
              result.selector !== getActiveSelector(key) ? (
                <div className="muted">Apply to verify the live effect.</div>
            ) : null}
            {result.messages.map((message) => (
                <div key={message} className="muted">
                    {message}
                </div>
            ))}
        </div>
    );

    const targetOrder = (target: DiscoveryTarget): number => {
        const status = results[target.id]?.status;
        if (status === "fail") return 0;
        if (status === "warn" && !target.optional) return 1;
        if (status === "pass") return 2;
        return 3;
    };

    const renderTargetCard = (target: DiscoveryTarget): JSX.Element => {
        const key = target.id;
        const definition = getSelectorDefinition(key);
        const result = results[key];
        const active = getActiveSelector(key);
        const draft = drafts[key] ?? active;
        const isDraft = draft.trim() !== active;
        const overridden = Boolean(overrides[key]);

        return (
            <details
                key={key}
                className="target"
                open={result?.status === "fail"}
            >
                <summary>
                    <span className={statusClass(result?.status)}>
                        {statusIcon(result?.status)}
                    </span>{" "}
                    {target.label}{" "}
                    <span className="muted">
                        ×{result?.count ?? target.currentCount}
                    </span>
                    {overridden ? (
                        <span className="badge warn">override</span>
                    ) : null}
                    {target.optional ? (
                        <span className="badge">optional</span>
                    ) : null}
                </summary>
                <form
                    className="card"
                    onSubmit={(event) => {
                        event.preventDefault();
                        check(key, draft);
                    }}
                >
                    <p className="about">
                        <strong>For:</strong> {definition.description}
                        <br />
                        <strong>Looks like:</strong> {definition.lookFor}
                    </p>
                    <input
                        className="selector-input"
                        value={draft}
                        spellCheck={false}
                        aria-label={`Selector for ${target.label}`}
                        onChange={(event) => {
                            const value = event.currentTarget.value;
                            setDrafts((previous) => ({
                                ...previous,
                                [key]: value,
                            }));
                        }}
                    />
                    <div className="row-meta">
                        <button type="button" onClick={() => check(key)}>
                            Check
                        </button>
                        <button
                            type="button"
                            className="primary"
                            disabled={!isDraft}
                            onClick={() => apply(key)}
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            disabled={
                                !overridden && draft === DEFAULT_SELECTORS[key]
                            }
                            onClick={() => reset(key)}
                        >
                            Reset
                        </button>
                        <button type="button" onClick={() => startPicking(key)}>
                            Pick
                        </button>
                        <button
                            type="button"
                            title="Repair drill: make the built-in selector match nothing"
                            onClick={() => toggleBreak(key)}
                        >
                            {breaks.includes(key) ? "Unbreak" : "Break"}
                        </button>
                        <span className="spacer" />
                        {breaks.includes(key) ? (
                            <span className="badge warn">simulated break</span>
                        ) : null}
                        {isDraft ? (
                            <span className="badge warn">draft</span>
                        ) : null}
                    </div>
                    {result ? renderResult(key, result) : null}
                    {overridden ? (
                        <div className="muted">
                            Default: <code>{DEFAULT_SELECTORS[key]}</code>
                        </div>
                    ) : null}
                    {target.suggestions.length ? (
                        <>
                            <h3>Suggestions</h3>
                            <ul>
                                {target.suggestions.map((candidate, index) =>
                                    renderCandidate(
                                        candidate,
                                        `${key}-${index}`,
                                        {
                                            foundElements: target.foundElements,
                                            onUse: () => {
                                                setDrafts((previous) => ({
                                                    ...previous,
                                                    [key]: candidate.selector,
                                                }));
                                                check(key, candidate.selector);
                                            },
                                        },
                                    ),
                                )}
                            </ul>
                        </>
                    ) : (
                        <p className="muted">
                            No heuristic suggestions. Use Pick, or open the
                            related UI and Retest all.
                        </p>
                    )}
                </form>
            </details>
        );
    };

    const renderWorkbench = (): JSX.Element | null => {
        if (!report) return null;
        const failing = report.targets.filter(
            (target) => results[target.id]?.status === "fail",
        ).length;
        const overrideCount = Object.keys(overrides).length;
        const ordered = [...report.targets].sort(
            (a, b) => targetOrder(a) - targetOrder(b),
        );

        return (
            <>
                <div className="row-meta">
                    <span className={failing ? "bad" : "ok"}>
                        {failing
                            ? `${failing} selector${
                                  failing === 1 ? "" : "s"
                              } failing`
                            : "No selectors failing"}
                    </span>
                    <span className="muted">
                        · {overrideCount} override
                        {overrideCount === 1 ? "" : "s"}
                    </span>
                    <span className="spacer" />
                    <button type="button" onClick={runAudit}>
                        Retest all
                    </button>
                </div>
                <div className="row-meta">
                    <span className="muted">Repair drill:</span>
                    <button
                        type="button"
                        title="Make every built-in selector match nothing"
                        onClick={breakAll}
                    >
                        Break all
                    </button>
                    <button
                        type="button"
                        className="primary"
                        onClick={runRepair}
                    >
                        Run Repair
                    </button>
                    <button
                        type="button"
                        title="Run Repair, then copy the working selectors and registry patch"
                        onClick={repairAndExport}
                    >
                        {flash === "export" ? "Copied" : "Repair & export"}
                    </button>
                    {breaks.length ? (
                        <button type="button" onClick={unbreakAll}>
                            Unbreak all ({breaks.length})
                        </button>
                    ) : null}
                </div>
                {notice ? <p className="notice">{notice}</p> : null}

                {staleOverrides.length ? (
                    <div className="notice row-meta warn-notice">
                        <span>
                            {staleOverrides.length} saved override
                            {staleOverrides.length === 1 ? " is" : "s are"}{" "}
                            worse than the built-in selector:{" "}
                            {staleOverrides
                                .map((key) => getSelectorDefinition(key).label)
                                .join(", ")}
                            .
                        </span>
                        <span className="spacer" />
                        <button
                            type="button"
                            className="primary"
                            onClick={resetStale}
                        >
                            Use built-ins
                        </button>
                    </div>
                ) : null}

                {ordered.map(renderTargetCard)}

                <div className="row-meta">
                    <button
                        type="button"
                        disabled={!overrideCount}
                        onClick={resetAll}
                    >
                        Reset all overrides
                    </button>
                    <span className="spacer" />
                    <button
                        type="button"
                        title="Download the full report, including the page inventory"
                        onClick={saveJson}
                    >
                        Save full JSON
                    </button>
                </div>

                <details>
                    <summary>CSS variables</summary>
                    <table>
                        <tbody>
                            {report.cssVariables.map((variable) => (
                                <tr key={variable.name}>
                                    <td
                                        className={
                                            variable.required && !variable.value
                                                ? "bad"
                                                : undefined
                                        }
                                    >
                                        {variable.name}
                                    </td>
                                    <td className="mono">
                                        {variable.value || "(not defined)"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </details>

                <details>
                    <summary>Page inventory</summary>
                    <h3>data-testid</h3>
                    <p className="mono">
                        {report.inventory.testIds
                            .map((item) => `${item.value} ×${item.count}`)
                            .join(" · ") || "—"}
                    </p>
                    <h3>data-* attributes</h3>
                    <p className="mono">
                        {report.inventory.dataAttributes
                            .map((item) => `${item.name} ×${item.count}`)
                            .join(" · ") || "—"}
                    </p>
                    <h3>ids</h3>
                    <p className="mono">
                        {report.inventory.ids.join(" · ") || "—"}
                    </p>
                </details>
            </>
        );
    };

    return (
        <>
            {view === "picking" ? (
                <div className="banner">
                    {pickTarget
                        ? `Click the ${getSelectorDefinition(
                              pickTarget,
                          ).label.toLowerCase()} · Esc to cancel`
                        : "Click an element to inspect · Esc to cancel"}
                </div>
            ) : null}
            {hover ? (
                <>
                    <div className="hover-box" style={boxStyle(hover.box)} />
                    <div
                        className="hover-label"
                        style={{
                            top: Math.max(0, hover.box.top - 18),
                            left: Math.max(0, hover.box.left),
                        }}
                    >
                        {hover.label}
                    </div>
                </>
            ) : null}
            {highlights.map((box, index) => (
                <div
                    key={index}
                    className="highlight-box"
                    style={boxStyle(box)}
                />
            ))}

            <div
                className={`panel ${dock}`}
                role="dialog"
                aria-label="Selector inspector"
            >
                <div className="head">
                    <span className="title">Selector Inspector</span>
                    <button
                        type="button"
                        className={view === "picking" ? "primary" : undefined}
                        onClick={() => startPicking()}
                    >
                        Pick
                    </button>
                    <button type="button" onClick={runAudit}>
                        Workbench
                    </button>
                    <button
                        type="button"
                        title="Copy a Markdown summary to paste into a chat or issue"
                        onClick={copyReport}
                    >
                        {flash === "report" ? "Copied" : "Copy report"}
                    </button>
                    <button
                        type="button"
                        aria-label="Move panel to the other side"
                        onClick={() =>
                            setDock((side) =>
                                side === "right" ? "left" : "right",
                            )
                        }
                    >
                        ⇄
                    </button>
                    <button
                        type="button"
                        aria-label="Close selector inspector"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="body">
                    {view === "picking" ? (
                        <p className="muted">
                            Hover the page and click the element you want
                            selectors for. Clicks are intercepted, so nothing on
                            ChatGPT activates.
                        </p>
                    ) : null}
                    {view === "element" ? renderElementView() : null}
                    {view === "audit" ? renderWorkbench() : null}
                </div>

                <div className="foot muted">
                    Alt+Shift+P pick · Alt+Shift+A workbench · overrides are
                    dev-only and saved locally
                </div>
            </div>
        </>
    );
}
