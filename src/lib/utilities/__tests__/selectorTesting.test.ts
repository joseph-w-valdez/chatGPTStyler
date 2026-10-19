import { testSelector } from "../selectorTesting";
import { getSelectorDefinition } from "@src/shared/selectors";
import { defaultSettings } from "@src/shared/settings";

const turnDefinition = getSelectorDefinition("messageTurn");

describe("testSelector", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        document.body.innerHTML = `
            <section data-turn="user"><div class="bubble">a</div></section>
            <section data-turn="assistant"><div>b</div></section>
            <section data-turn="assistant"><div>c</div></section>
        `;
    });

    const turns = (): Element[] =>
        Array.from(document.querySelectorAll("section"));

    it("fails invalid selectors without throwing", () => {
        const result = testSelector({
            definition: turnDefinition,
            selector: "[data-turn=",
            found: turns(),
            settings: null,
            active: false,
        });

        expect(result).toMatchObject({ valid: false, status: "fail" });
    });

    it("fails a required target with too few matches", () => {
        const result = testSelector({
            definition: turnDefinition,
            selector: "[data-testid^='conversation-turn-']",
            found: turns(),
            settings: null,
            active: false,
        });

        expect(result.status).toBe("fail");
        expect(result.count).toBe(0);
    });

    it("warns when a repeated target only covers part of the found elements", () => {
        const result = testSelector({
            definition: turnDefinition,
            selector: '[data-turn="user"]',
            found: turns(),
            settings: null,
            active: false,
        });

        expect(result).toMatchObject({ status: "warn", count: 1, coverage: 1 });
    });

    it("passes when every found element is covered", () => {
        const result = testSelector({
            definition: turnDefinition,
            selector: "section",
            found: turns(),
            settings: null,
            active: false,
        });

        expect(result).toMatchObject({ status: "pass", count: 3, coverage: 3 });
    });

    it("warns when a selector is much broader than the found elements", () => {
        const result = testSelector({
            definition: getSelectorDefinition("userTurn"),
            selector: "section, div",
            found: turns().slice(0, 2),
            settings: null,
            active: false,
        });

        expect(result.status).toBe("warn");
        expect(result.messages.join(" ")).toContain("Broader than the target");
    });

    it("allows the profile button's two legitimate copies but not dozens", () => {
        document.body.innerHTML = `${'<button class="p"></button>'.repeat(2)}`;
        const profile = getSelectorDefinition("profileButton");
        const two = testSelector({
            definition: profile,
            selector: ".p",
            found: [],
            settings: null,
            active: false,
        });
        expect(two.status).toBe("pass");

        document.body.innerHTML = `${'<button class="p"></button>'.repeat(30)}`;
        const many = testSelector({
            definition: profile,
            selector: ".p",
            found: [],
            settings: null,
            active: false,
        });
        expect(many.status).toBe("warn");
    });

    it("verifies the live effect for an active selector", () => {
        const style = document.createElement("style");
        style.textContent = `.bubble { background-color: ${defaultSettings.messageColorUserStyle}; }`;
        document.head.appendChild(style);
        const bubble = getSelectorDefinition("userBubble");

        const styled = testSelector({
            definition: bubble,
            selector: ".bubble",
            found: [],
            settings: defaultSettings,
            active: true,
        });
        expect(styled.effect).toMatchObject({ status: "pass" });
        expect(styled.status).toBe("pass");

        style.textContent = "";
        const unstyled = testSelector({
            definition: bubble,
            selector: ".bubble",
            found: [],
            settings: defaultSettings,
            active: true,
        });
        expect(unstyled.effect).toMatchObject({ status: "fail" });
        expect(unstyled.status).toBe("fail");
    });

    it("skips the effect check for drafts that are not applied", () => {
        const result = testSelector({
            definition: getSelectorDefinition("userBubble"),
            selector: ".bubble",
            found: [],
            settings: defaultSettings,
            active: false,
        });

        expect(result.effect).toBeNull();
    });
});
