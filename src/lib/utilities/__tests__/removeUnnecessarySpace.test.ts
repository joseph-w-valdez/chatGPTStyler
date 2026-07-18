import { removeUnnecessarySpace } from "../removeUnnecessarySpace";

describe("removeUnnecessarySpace", () => {
    it("no-ops when the input box container is missing", () => {
        expect(() =>
            removeUnnecessarySpace({
                userTextContainer: [],
                inputBoxContainer: null,
            }),
        ).not.toThrow();
    });

    it("removes layout classes when nodes are present", () => {
        const inputBoxContainer = document.createElement("div");
        inputBoxContainer.className =
            "max-w-(--thread-content-max-width) gap-4 md:gap-5 lg:gap-6";

        const userTextContainer = document.createElement("div");
        userTextContainer.className = "items-end";
        const child = document.createElement("div");
        child.className = "px-5";
        userTextContainer.appendChild(child);

        removeUnnecessarySpace({
            userTextContainer: [userTextContainer],
            inputBoxContainer,
        });

        expect(inputBoxContainer.className).toBe("");
        expect(userTextContainer.classList.contains("items-end")).toBe(false);
        expect(child.classList.contains("px-5")).toBe(false);
    });
});
