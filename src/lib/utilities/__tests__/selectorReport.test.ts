import { formatWorkbenchReport, maskPath } from "../selectorReport";
import { discoverSelectors, findTargetElements } from "../selectorDiscovery";
import { testSelector } from "../selectorTesting";
import {
    getSelectorDefinition,
    SELECTOR_DEFINITIONS,
} from "@src/shared/selectors";

describe("maskPath", () => {
    it("hides conversation, GPT, and project ids", () => {
        expect(maskPath("/c/6ad5021e-4844-83e8-a0ba-ee5d3711503e")).toBe(
            "/c/<conversation>",
        );
        expect(maskPath("/g/g-abc123/c/xyz")).toBe("/g/<gpt>/c/<conversation>");
        expect(maskPath("/project/p-1")).toBe("/project/<project>");
    });
});

describe("formatWorkbenchReport", () => {
    it("lists failing selectors first with what they should match", () => {
        document.body.innerHTML = "<main></main>";
        const found = findTargetElements(document);
        const report = discoverSelectors(document, found);
        const results = Object.fromEntries(
            SELECTOR_DEFINITIONS.map((definition) => [
                definition.key,
                testSelector({
                    definition,
                    selector: definition.defaultSelector,
                    found: found.get(definition.key) || [],
                    settings: null,
                    active: true,
                }),
            ]),
        );

        const markdown = formatWorkbenchReport({
            report,
            results,
            overrides: { composerForm: "form.composer" },
            environment: {
                capturedAt: "2026-10-19T00:00:00.000Z",
                page: "chatgpt.com/c/<conversation>",
                extensionVersion: "1.4.0",
                chatgptTheme: "dark",
                viewport: "1440×900",
            },
        });

        expect(markdown).toContain("## ChatGPT Styler selector report");
        expect(markdown).toContain("### Failing");
        expect(markdown).toContain(
            `Should match: ${getSelectorDefinition("messageTurn").lookFor}`,
        );
        expect(markdown).toContain("### Passing");
        expect(markdown).toContain("`composerForm`: `form.composer`");
        expect(markdown.indexOf("### Failing")).toBeLessThan(
            markdown.indexOf("### Passing"),
        );
        expect(markdown).not.toContain("6ad5021e");
    });
});
