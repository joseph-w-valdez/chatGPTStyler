import { DEFAULT_SELECTORS, SELECTOR_DEFINITIONS } from "@src/shared/selectors";
import { getSelectorProbes } from "../selectorProbes";

const OLD_LAYOUT = `
    <main></main>
    <section data-testid="conversation-turn-1" data-turn="user">
        <div data-conversation-screenshot-content>
            <div data-message-author-role="user">
                <div class="user-message-bubble-color"></div>
            </div>
        </div>
    </section>
    <section data-testid="conversation-turn-2" data-turn="assistant">
        <div data-message-author-role="assistant"></div>
    </section>
    <div data-scroll-root></div>
    <div id="thread-bottom-container">
        <div style="--thread-scroll-to-bottom-banner-offset: 0px;"></div>
    </div>
    <div id="thread-bottom"><div><div><div><div></div></div></div></div></div>
    <form></form>
    <div data-testid="accounts-profile-button" role="button"></div>
`;

describe("getSelectorProbes", () => {
    it("probes every registry key plus the extension's own nodes", () => {
        const ids = getSelectorProbes().map((probe) => probe.id);

        SELECTOR_DEFINITIONS.forEach(({ key }) => expect(ids).toContain(key));
        expect(ids).toEqual(
            expect.arrayContaining(["roles", "customStyle", "scrollMount"]),
        );
    });

    it("still matches the pre-app-shell layout through registry fallbacks", () => {
        document.body.innerHTML = OLD_LAYOUT;

        SELECTOR_DEFINITIONS.filter(
            (definition) => !definition.optional,
        ).forEach(({ key }) => {
            expect(
                document.querySelectorAll(DEFAULT_SELECTORS[key]).length,
            ).toBeGreaterThan(0);
        });
        expect(
            document.querySelectorAll(DEFAULT_SELECTORS.messageTurn),
        ).toHaveLength(2);
    });
});
