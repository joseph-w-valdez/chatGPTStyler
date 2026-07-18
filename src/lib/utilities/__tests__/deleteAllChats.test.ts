import { deleteAllChats, deleteAllChatsRuntime } from "../deleteAllChats";

const setHtml = (html: string): void => {
    document.body.innerHTML = html;
};

const fullFlowHtml = `
    <div id="history"><ul><li><a href="/c/abc">chat</a></li></ul></div>
    <div data-testid="accounts-profile-button" role="button"></div>
    <div data-testid="settings-menu-item" role="menuitem">Settings</div>
    <div role="dialog" data-state="open">
        <button
            data-testid="data-controls-tab"
            role="tab"
            data-state="active"
            aria-selected="true"
        >
            Data controls
        </button>
        <button class="btn btn-danger-outline" aria-label="Delete all Delete all chats">
            Delete all
        </button>
        <button data-testid="confirm-delete-all-chats-button">Confirm deletion</button>
    </div>
`;

describe("deleteAllChats", () => {
    let reloadSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = "";
        reloadSpy = jest
            .spyOn(deleteAllChatsRuntime, "reload")
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        reloadSpy.mockRestore();
    });

    it("fails when chat history is missing", async () => {
        setHtml(
            `<div data-testid="accounts-profile-button" role="button"></div>`,
        );

        await expect(deleteAllChats()).resolves.toEqual({
            status: "FAILURE",
            message: "No chat history found",
        });
    });

    it("fails when the profile button is missing", async () => {
        setHtml(`
            <div id="history"><ul><li><a href="/c/abc">chat</a></li></ul></div>
        `);

        await expect(deleteAllChats()).resolves.toEqual({
            status: "FAILURE",
            message: "Profile button not found!",
        });
    });

    it("completes the full delete flow when UI nodes are present", async () => {
        setHtml(fullFlowHtml);

        const confirm = document.querySelector(
            '[data-testid="confirm-delete-all-chats-button"]',
        ) as HTMLElement;
        const clickSpy = jest.spyOn(confirm, "dispatchEvent");

        await expect(deleteAllChats()).resolves.toEqual({
            status: "SUCCESS",
        });
        expect(clickSpy).toHaveBeenCalled();
        jest.runOnlyPendingTimers();
        expect(reloadSpy).toHaveBeenCalled();
    });

    it("skips the inert (collapsed-rail) profile button", async () => {
        setHtml(`
            <nav inert>
                <div data-testid="accounts-profile-button" role="button" id="rail"></div>
            </nav>
            ${fullFlowHtml}
        `);

        const railButton = document.getElementById("rail") as HTMLElement;
        const profileButtons = document.querySelectorAll(
            '[data-testid="accounts-profile-button"]',
        );
        const visible = profileButtons[1] as HTMLElement;
        const railSpy = jest.spyOn(railButton, "dispatchEvent");
        const visibleSpy = jest.spyOn(visible, "dispatchEvent");

        await expect(deleteAllChats()).resolves.toEqual({
            status: "SUCCESS",
        });
        expect(visibleSpy).toHaveBeenCalled();
        expect(railSpy).not.toHaveBeenCalled();
        jest.runOnlyPendingTimers();
        expect(reloadSpy).toHaveBeenCalled();
    });

    it("fails with a timeout when a later step never appears", async () => {
        setHtml(`
            <div id="history"><ul><li><a href="/c/abc">chat</a></li></ul></div>
            <div data-testid="accounts-profile-button" role="button"></div>
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
