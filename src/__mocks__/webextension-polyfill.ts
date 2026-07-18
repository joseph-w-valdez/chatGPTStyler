// Manual mock for `webextension-polyfill` used by Jest (see jest.config.js moduleNameMapper).
type Listener = (...args: unknown[]) => void;

const createEvent = () => ({
    addListener: jest.fn((listener: Listener) => listener),
    removeListener: jest.fn(),
    hasListener: jest.fn(() => false),
});

const createPort = () => ({
    name: "popup",
    postMessage: jest.fn(),
    disconnect: jest.fn(),
    onMessage: createEvent(),
    onDisconnect: createEvent(),
});

const browser = {
    tabs: {
        executeScript: jest.fn(() => Promise.resolve({ done: true })),
        query: jest.fn(() => Promise.resolve([])),
    },
    runtime: {
        connect: jest.fn(() => createPort()),
        sendMessage: jest.fn(() => Promise.resolve()),
    },
};

export default browser;

interface Tab {
    id: number;
}

export interface Tabs {
    Tab: Tab;
}
