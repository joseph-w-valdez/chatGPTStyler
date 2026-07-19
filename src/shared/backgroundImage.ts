// Shared contract for the optional conversation background image.
// The image data URL is large, so it lives in chrome.storage.local (not sync).
export const BACKGROUND_IMAGE_STORAGE_KEY = "backgroundImage";

// DOM ids/classes for the content-script-injected background layer. Shared so
// stylingFunctions (CSS) and the content script (DOM) stay in sync.
export const BACKGROUND_LAYER_ID = "chatgpt-styler-bg-layer";
export const BACKGROUND_LAYER_IMAGE_CLASS = "chatgpt-styler-bg-image";

// 15 MB raw file cap for larger static images and short animated GIFs/WebPs.
// As a base64 data URL this is ~20 MB, which exceeds chrome.storage.local's
// default 10 MB quota — so the extension declares the unlimitedStorage
// permission.
export const MAX_BACKGROUND_IMAGE_BYTES = 15 * 1024 * 1024;

export const ACCEPTED_BACKGROUND_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
] as const;

export const ACCEPTED_BACKGROUND_IMAGE_ACCEPT =
    ACCEPTED_BACKGROUND_IMAGE_TYPES.join(",");
