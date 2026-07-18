import { checkSelectors, CONVERSATION_TURN_SELECTOR } from "../checkSelectors";

describe("checkSelectors", () => {
    it("marks required probes missing from an empty document as failed", () => {
        document.body.innerHTML = "";
        const report = checkSelectors(document);

        expect(report.requiredFail).toBeGreaterThan(0);
        const turns = report.items.find((item) => item.id === "turns");
        expect(turns?.ok).toBe(false);
        expect(turns?.count).toBe(0);
    });

    it("passes required probes when expected nodes are present", () => {
        document.body.innerHTML = `
            <div data-testid="conversation-turn-1"></div>
            <div id="thread-bottom"><div><div></div></div></div>
            <form></form>
            <button id="composer-submit-button"></button>
            <div role="presentation"><div><div><div><div></div></div></div></div></div>
            <style id="custom-style"></style>
            <button aria-label="Open Profile Menu"></button>
        `;

        const report = checkSelectors(document);
        expect(report.requiredFail).toBe(0);
        expect(
            report.items.find((item) => item.id === "turns")?.count,
        ).toBeGreaterThan(0);
        expect(
            document.querySelectorAll(CONVERSATION_TURN_SELECTOR).length,
        ).toBe(1);
    });
});
