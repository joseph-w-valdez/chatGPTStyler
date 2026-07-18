import { deleteAllChats } from "../deleteAllChats";

const setHtml = (html: string): void => {
    document.body.innerHTML = html;
};

describe("deleteAllChats", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = "";
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("fails when chat history is missing", async () => {
        setHtml(`<button aria-label="Open Profile Menu"></button>`);

        await expect(deleteAllChats()).resolves.toEqual({
            status: "FAILURE",
            message: "No chat history found",
        });
    });

    it("fails when the profile button is missing", async () => {
        setHtml(`
            <div class="group/sidebar">
                <div></div>
                <div></div>
                <div><div>chat</div></div>
            </div>
        `);

        await expect(deleteAllChats()).resolves.toEqual({
            status: "FAILURE",
            message: "Profile button not found!",
        });
    });

    it("completes the full delete flow when UI nodes are present", async () => {
        setHtml(`
            <div class="group/sidebar">
                <div></div>
                <div></div>
                <div><div>chat</div></div>
            </div>
            <button aria-label="Open Profile Menu"></button>
            <button data-testid="settings-menu-item"></button>
            <button data-testid="delete-all-chats-button"></button>
            <button data-testid="confirm-delete-all-chats-button"></button>
        `);

        const confirm = document.querySelector(
            '[data-testid="confirm-delete-all-chats-button"]',
        ) as HTMLButtonElement;
        const clickSpy = jest.spyOn(confirm, "click");

        await expect(deleteAllChats()).resolves.toEqual({
            status: "SUCCESS",
        });
        expect(clickSpy).toHaveBeenCalled();
    });

    it("fails with a timeout when a later step never appears", async () => {
        setHtml(`
            <div class="group/sidebar">
                <div></div>
                <div></div>
                <div><div>chat</div></div>
            </div>
            <button aria-label="Open Profile Menu"></button>
        `);

        const resultPromise = deleteAllChats();
        // Allow waitForElement to register its interval, then expire it.
        await Promise.resolve();
        jest.advanceTimersByTime(10000);
        await Promise.resolve();

        await expect(resultPromise).resolves.toEqual({
            status: "FAILURE",
            message: expect.stringContaining("Timed out waiting for selector"),
        });
    });
});
