// Shared Chrome extension API stubs for Jest.
const chromeMock = {
    storage: {
        sync: {
            get: jest.fn(
                (
                    _keys: string | string[] | Record<string, unknown>,
                    callback: (result: Record<string, unknown>) => void,
                ) => {
                    callback({});
                },
            ),
            set: jest.fn(
                (_items: Record<string, unknown>, callback?: () => void) => {
                    if (callback) callback();
                },
            ),
        },
        local: {
            get: jest.fn(
                (
                    _keys: string | string[] | Record<string, unknown>,
                    callback: (result: Record<string, unknown>) => void,
                ) => {
                    callback({});
                },
            ),
            set: jest.fn(
                (_items: Record<string, unknown>, callback?: () => void) => {
                    if (callback) callback();
                },
            ),
            remove: jest.fn(
                (_keys: string | string[], callback?: () => void) => {
                    if (callback) callback();
                },
            ),
        },
    },
    tabs: {
        query: jest.fn(
            (
                _queryInfo: chrome.tabs.QueryInfo,
                callback: (tabs: Array<{ id: number; url: string }>) => void,
            ) => {
                callback([{ id: 1, url: "https://chatgpt.com/" }]);
            },
        ),
        sendMessage: jest.fn(),
    },
    runtime: {
        connect: jest.fn(() => ({
            postMessage: jest.fn(),
            disconnect: jest.fn(),
            onMessage: {
                addListener: jest.fn(),
                removeListener: jest.fn(),
            },
            onDisconnect: {
                addListener: jest.fn(),
                removeListener: jest.fn(),
            },
        })),
        sendMessage: jest.fn(),
        lastError: undefined as chrome.runtime.LastError | undefined,
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).chrome = chromeMock;
