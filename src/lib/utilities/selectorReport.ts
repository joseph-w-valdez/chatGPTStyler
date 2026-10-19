import {
    DEFAULT_SELECTORS,
    getSelectorDefinition,
    SelectorKey,
} from "@src/shared/selectors";
import { SelectorOverrides } from "./activeSelectors";
import {
    DiscoveryReport,
    DiscoveryTarget,
    ElementSummary,
    ProbeMatch,
    SelectorCandidate,
} from "./selectorDiscovery";
import { SelectorTestResult, SelectorTestStatus } from "./selectorTesting";

export type ReportEnvironment = {
    capturedAt: string;
    /** Path with conversation / GPT ids masked. */
    page: string;
    extensionVersion: string;
    chatgptTheme: string;
    viewport: string;
};

const MAX_SUGGESTIONS_SHOWN = 3;
const MAX_HINTS = 15;

const code = (value: string): string => `\`${value.replace(/`/g, "\\`")}\``;

const plural = (count: number, word: string): string =>
    `${count} ${word}${count === 1 ? "" : "s"}`;

/** Masks ids that identify a conversation or custom GPT. */
export const maskPath = (pathname: string): string =>
    pathname
        .replace(/\/c\/[^/]+/g, "/c/<conversation>")
        .replace(/\/g\/[^/]+/g, "/g/<gpt>")
        .replace(/\/project\/[^/]+/g, "/project/<project>");

export const captureEnvironment = (
    doc: Document = document,
): ReportEnvironment => {
    let extensionVersion = "unknown";
    try {
        extensionVersion = chrome.runtime.getManifest().version;
    } catch {
        extensionVersion = "unknown";
    }

    const root = doc.documentElement;
    const view = doc.defaultView;

    return {
        capturedAt: new Date().toISOString(),
        page: doc.location
            ? `${doc.location.host}${maskPath(doc.location.pathname)}`
            : "",
        extensionVersion,
        chatgptTheme: root.classList.contains("dark")
            ? "dark"
            : root.classList.contains("light")
            ? "light"
            : "unknown",
        viewport: view ? `${view.innerWidth}×${view.innerHeight}` : "unknown",
    };
};

const formatResult = (result: SelectorTestResult | undefined): string => {
    if (!result) return "not tested";
    if (!result.valid) return "invalid selector";
    const parts = [`${result.count} match${result.count === 1 ? "" : "es"}`];
    if (result.foundElements) {
        parts.push(`covers ${result.coverage}/${result.foundElements}`);
    }
    if (result.effect)
        parts.push(`effect ${result.effect.status}: ${result.effect.detail}`);
    return parts.join(" · ");
};

const formatSuggestions = (target: DiscoveryTarget): string =>
    target.suggestions.length
        ? target.suggestions
              .slice(0, MAX_SUGGESTIONS_SHOWN)
              .map(
                  (candidate) =>
                      `${code(candidate.selector)} (×${
                          candidate.count
                      }, covers ${candidate.coverage}/${target.foundElements})`,
              )
              .join(", ")
        : target.foundElements
        ? "none stable enough"
        : "heuristics found no matching elements";

const statusMark: Record<SelectorTestStatus, string> = {
    pass: "✓",
    warn: "!",
    fail: "✗",
};

/** Paste-ready Markdown summary of a workbench run, failing selectors first. */
export const formatWorkbenchReport = ({
    report,
    results,
    overrides,
    environment,
}: {
    report: DiscoveryReport;
    results: Partial<Record<SelectorKey, SelectorTestResult>>;
    overrides: SelectorOverrides;
    environment: ReportEnvironment;
}): string => {
    const byStatus = (status: SelectorTestStatus, optional?: boolean) =>
        report.targets.filter(
            (target) =>
                results[target.id]?.status === status &&
                (optional === undefined || target.optional === optional),
        );

    const failing = byStatus("fail");
    const warnings = byStatus("warn", false);
    const optionalMissing = byStatus("warn", true);
    const passing = byStatus("pass");
    const overrideKeys = Object.keys(overrides) as SelectorKey[];

    const detailed = (target: DiscoveryTarget): string[] => {
        const result = results[target.id];
        const lines = [
            `- ${statusMark[result?.status ?? "fail"]} **${
                target.label
            }** (${code(target.id)})`,
            `  - Should match: ${getSelectorDefinition(target.id).lookFor}`,
            `  - Active: ${code(target.currentSelector)} — ${formatResult(
                result,
            )}`,
        ];
        if (target.overridden) {
            lines.push(`  - Default: ${code(target.defaultSelector)}`);
        }
        result?.messages.forEach((message) =>
            lines.push(`  - Note: ${message}`),
        );
        lines.push(`  - Suggestions: ${formatSuggestions(target)}`);
        return lines;
    };

    const lines: string[] = [
        "## ChatGPT Styler selector report",
        "",
        `- Captured: ${environment.capturedAt}`,
        `- Page: ${environment.page}`,
        `- Extension: ${environment.extensionVersion} (dev build)`,
        `- ChatGPT theme: ${environment.chatgptTheme} · viewport ${environment.viewport}`,
        `- Summary: ${failing.length} failing · ${warnings.length} warnings · ${
            passing.length
        } passing · ${optionalMissing.length} optional not present · ${plural(
            overrideKeys.length,
            "override",
        )}`,
    ];

    if (failing.length) {
        lines.push("", "### Failing", ...failing.flatMap(detailed));
    }
    if (warnings.length) {
        lines.push("", "### Warnings", ...warnings.flatMap(detailed));
    }
    if (passing.length) {
        lines.push(
            "",
            "### Passing",
            ...passing.map(
                (target) =>
                    `- ✓ ${target.label} (${code(target.id)}) — ${formatResult(
                        results[target.id],
                    )}`,
            ),
        );
    }
    if (optionalMissing.length) {
        lines.push(
            "",
            "### Optional, not on the page (open the related UI to test)",
            `- ${optionalMissing.map((target) => code(target.id)).join(", ")}`,
        );
    }
    if (overrideKeys.length) {
        lines.push(
            "",
            "### Overrides in use",
            ...overrideKeys.map(
                (key) =>
                    `- ${code(key)}: ${code(
                        overrides[key] as string,
                    )} (default ${code(DEFAULT_SELECTORS[key])})`,
            ),
        );
    }

    const missingVariables = report.cssVariables.filter(
        (variable) => variable.required && !variable.value,
    );
    lines.push(
        "",
        "### Page hints",
        `- data-testid: ${
            report.inventory.testIds
                .slice(0, MAX_HINTS)
                .map((item) => `${item.value} ×${item.count}`)
                .join(", ") || "none"
        }`,
        `- data-* attributes: ${
            report.inventory.dataAttributes
                .slice(0, MAX_HINTS)
                .map((item) => `${item.name} ×${item.count}`)
                .join(", ") || "none"
        }`,
        `- CSS variables: ${
            report.cssVariables
                .map(
                    (variable) =>
                        `${variable.name}=${variable.value || "(missing)"}`,
                )
                .join(", ") || "none"
        }`,
    );
    if (missingVariables.length) {
        lines.push(
            `- Missing required variables: ${missingVariables
                .map((variable) => code(variable.name))
                .join(", ")}`,
        );
    }

    return lines.join("\n");
};

/** Paste-ready Markdown summary of a single picked element. */
export const formatElementReport = ({
    summary,
    ancestors,
    probes,
    candidates,
    pickTarget,
    environment,
}: {
    summary: ElementSummary;
    ancestors: string[];
    probes: ProbeMatch[];
    candidates: SelectorCandidate[];
    pickTarget: SelectorKey | null;
    environment: ReportEnvironment;
}): string => {
    const lines: string[] = [
        "## ChatGPT Styler picked element",
        "",
        `- Captured: ${environment.capturedAt}`,
        `- Page: ${environment.page} · extension ${environment.extensionVersion} · theme ${environment.chatgptTheme} · viewport ${environment.viewport}`,
    ];
    if (pickTarget) {
        lines.push(
            `- Picked for: ${getSelectorDefinition(pickTarget).label} (${code(
                pickTarget,
            )})`,
        );
    }
    lines.push(
        `- Element: ${code(summary.label)}`,
        `- Path: ${[...ancestors, summary.label].map(code).join(" > ")}`,
        "",
        "### Attributes",
        ...summary.attributes.map(
            (attr) => `- ${attr.name}: ${code(attr.value)}`,
        ),
        `- class: ${
            summary.classes.length ? code(summary.classes.join(" ")) : "none"
        }`,
        ...summary.inlineCustomProperties.map(
            (prop) => `- ${prop.name}: ${code(prop.value)}`,
        ),
        "",
        "### Extension selectors touching it",
        ...(probes.length
            ? probes.map(
                  (probe) =>
                      `- ${probe.label} (${probe.relation}): ${code(
                          probe.selector,
                      )}`,
              )
            : ["- none"]),
        "",
        "### Candidates",
        ...(candidates.length
            ? candidates.map(
                  (candidate) =>
                      `- ${code(candidate.selector)} — ${candidate.kind}, ×${
                          candidate.count
                      }, score ${candidate.score}`,
              )
            : ["- none"]),
    );

    return lines.join("\n");
};
