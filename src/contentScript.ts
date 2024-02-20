console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement("style");
customStyle.id = "custom-style";
document.head.appendChild(customStyle);

console.log("KEVIN TESTING");

let messageMaxWidthStyle = "";
let messagePaddingStyle = "";
let messageBorderRadiusStyle = "";
let inputBoxMaxWidthStyle = "";
let messageBoxColors = "";
let messageColorUser = "";
let messageColorChatGPT = "";
let textColorUserStyle = "";
let textColorNonUserStyle = "";
let textSizeUserStyle = "";
let textSizeNonUserStyle = "";
let textWeightUserStyle = "";
let textWeightNonUserStyle = "";
const selectionColors = "";
const chatMessageButtons = `
    [data-testid] button {
      visibility: unset
    }
`;
const codeSnippetWidth = `
    [data-testid] > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
`;

const updateMessageColor = (
    userColor: string,
    chatGPTColor: string,
    isDark: boolean,
) => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            userColor ? userColor : "#4e7645"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            chatGPTColor ? chatGPTColor : "#3c6083"
        } }
      }
      .light {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            userColor ? userColor : "#62B1F6"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            chatGPTColor ? chatGPTColor : "#EEEEEE"
        } }
      }
    `;
    updateAllStyles();
};

const updateMessageColorUser = (color: string) => {
    messageColorUser = `
        [data-testid]:nth-child(even) > * > * { background-color: ${color} !important }`;
    updateAllStyles();
};

const updateMessageColorChatGPT = (color: string) => {
    messageColorChatGPT = `
        [data-testid]:nth-child(odd) > * > * { background-color: ${color} !important }`;
    updateAllStyles();
};

const updateAllStyles = () => {
    customStyle.textContent =
        messageBoxColors +
        messageMaxWidthStyle +
        messagePaddingStyle +
        messageBorderRadiusStyle +
        inputBoxMaxWidthStyle +
        textColorUserStyle +
        textColorNonUserStyle +
        textSizeUserStyle +
        textSizeNonUserStyle +
        textWeightUserStyle +
        textWeightNonUserStyle +
        selectionColors +
        chatMessageButtons +
        codeSnippetWidth +
        messageColorUser +
        messageColorChatGPT;
};

const updateMessageMaxWidth = (widthPercentage: number) => {
    messageMaxWidthStyle = `@media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
    updateAllStyles();
};

const updateMessagePadding = (padding: number) => {
    messagePaddingStyle = `[data-testid] > * > * { padding: ${padding}px; }`;
    updateAllStyles();
};

const updateMessageBorderRadius = (borderRadius: number) => {
    messageBorderRadiusStyle = `[data-testid] > * > * { border-radius: ${borderRadius}px; }`;
    updateAllStyles();
};

const updateInputBoxMaxWidth = (widthPercentage: number) => {
    inputBoxMaxWidthStyle = `@media (min-width: 1600px) {
      form { max-width: ${widthPercentage}% !important; }
    }`;
    updateAllStyles();
};

const updateTextColorStyle = (color: string, isUser: boolean) => {
    switch (isUser) {
        case true:
            textColorUserStyle = `[data-testid]:nth-child(even) > * > * > * > * > * { color: ${color}}`;
            updateAllStyles();
            break;
        case false:
            textColorNonUserStyle = `[data-testid]:nth-child(odd) > * > * > * > * > div p { color: ${color}}`;
            updateAllStyles();
            break;
    }
};

const updateTextSizeStyle = (size: number, isUser: boolean) => {
    switch (isUser) {
        case true:
            textSizeUserStyle = `[data-testid]:nth-child(even) > * > * > * > * > * { font-size: ${size}px}`;
            updateAllStyles();
            break;
        case false:
            textSizeNonUserStyle = `[data-testid]:nth-child(odd) > * > * > * > * > div p { font-size: ${size}px}`;
            updateAllStyles();
            break;
    }
};

const updateFontWeightStyle = (weight: string, isUser: boolean) => {
    switch (isUser) {
        case true:
            textWeightUserStyle = `[data-testid]:nth-child(even) > * > * > * > * > * { font-weight: ${weight}} `;
            updateAllStyles();
            break;
        case false:
            textWeightNonUserStyle = `[data-testid]:nth-child(odd) > * > * > * > * > div p { font-weight: ${weight}} `;
            updateAllStyles();
            break;
    }
};

const resetDefaultMessageColors = () => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: #4e7645 }
        [data-testid]:nth-child(odd) > * > * { background-color: #3c6083 }
        [data-testid] textarea {
            padding: 3px;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px
        }
      }
      .light {
        [data-testid]:nth-child(even) > * > * { background-color: #62B1F6 }
        [data-testid]:nth-child(odd) > * > * { background-color: #EEEEEE }
        [data-testid] textarea {
            padding: 3px;
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 5px
        }
      }
`;
    updateAllStyles();
};

const $main = document.querySelector("main");

if ($main) {
    const scrollToBottom = () => {
        const $messagesContainer = document.querySelector(
            '[role="presentation"] > div > div > div',
        );
        if ($messagesContainer) {
            setTimeout(
                () =>
                    ($messagesContainer.scrollTop =
                        $messagesContainer.scrollHeight),
                0,
            );
            $messagesContainer.scrollTop = $messagesContainer.scrollHeight;
        }
    };

    $main.addEventListener("keydown", (event: KeyboardEvent) => {
        if (
            event.target instanceof HTMLTextAreaElement &&
            event.target.getAttribute("id") === "prompt-textarea" &&
            event.target.textContent !== "" &&
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            scrollToBottom();
        }
    });

    $main.addEventListener("click", (event) => {
        if (
            (event.target instanceof HTMLButtonElement &&
                event.target.getAttribute("data-testid") === "send-button") ||
            (event.target instanceof SVGElement &&
                event.target.closest('[data-testid="send-button"]'))
        ) {
            scrollToBottom();
        }
    });
}

const setDefaultSettings = () => {
    updateMessageMaxWidth(95);
    updateMessagePadding(10);
    updateMessageBorderRadius(5);
    updateInputBoxMaxWidth(70);
    resetDefaultMessageColors();
    // updateMessageColor("", "", true);
    updateTextColorStyle("#000000", true);
    updateTextColorStyle("#6699ff", false);
    updateTextSizeStyle(18, true);
    updateTextSizeStyle(18, false);
    updateFontWeightStyle("heavy", true);
    updateFontWeightStyle("heavy", false);
};

// set default settings on load
setDefaultSettings();

// Load settings and apply them

const loadSettings = () => {
    chrome.storage.sync.get(["options"], (result) => {
        const settings = result.options;
        if (settings) {
            // Assuming 'settings' is an object with appropriate properties
            // Update styles based on loaded settings
            if (settings.messageMaxWidthStyle)
                updateMessageMaxWidth(settings.messageMaxWidthStyle);
            if (settings.messageColorUserStyle)
                updateMessageColorUser(settings.messageColorUserStyle);
            if (settings.messageColorNonUserStyle)
                updateMessageColorChatGPT(settings.messageColorNonUserStyle);
            if (settings.messagePaddingStyle)
                updateMessagePadding(settings.messagePaddingStyle);
            if (settings.messageBorderRadiusStyle)
                updateMessageBorderRadius(settings.messageBorderRadiusStyle);
            if (settings.inputBoxMaxWidthStyle)
                updateInputBoxMaxWidth(settings.inputBoxMaxWidthStyle);
            if (settings.textColorUserStyle)
                updateTextColorStyle(settings.textColorUserStyle, true);
            if (settings.textColorNonUserStyle)
                updateTextColorStyle(settings.textColorNonUserStyle, false);
            if (settings.textSizeUserStyle)
                updateTextSizeStyle(settings.textSizeUserStyle, true);
            if (settings.textSizeNonUserStyle)
                updateTextSizeStyle(settings.textSizeNonUserStyle, false);
            if (settings.textWeightUserStyle)
                updateFontWeightStyle(settings.textWeightUserStyle, true);
            if (settings.textWeightNonUserStyle)
                updateFontWeightStyle(settings.textWeightNonUserStyle, false);
        } else {
            // Set default styles if no settings are found
            setDefaultSettings();
        }
    });
};

// Listen for changes in Chrome Storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.options.newValue) {
        const newSettings = changes.options.newValue;
        // const oldSettings = changes.options.oldValue;
        console.log(changes.options);
        console.log("Settings changed", newSettings);
        if (newSettings.messageMaxWidthStyle)
            updateMessageMaxWidth(newSettings.messageMaxWidthStyle);
        if (newSettings.messageColorUserStyle)
            updateMessageColorUser(newSettings.messageColorUserStyle);
        if (newSettings.messageColorNonUserStyle)
            updateMessageColorChatGPT(newSettings.messageColorNonUserStyle);
        if (newSettings.messagePaddingStyle)
            updateMessagePadding(newSettings.messagePaddingStyle);
        if (newSettings.messageBorderRadiusStyle)
            updateMessageBorderRadius(newSettings.messageBorderRadiusStyle);
        if (newSettings.inputBoxMaxWidthStyle)
            updateInputBoxMaxWidth(newSettings.inputBoxMaxWidthStyle);
        if (newSettings.textColorUserStyle)
            updateTextColorStyle(newSettings.textColorUserStyle, true);
        if (newSettings.textColorNonUserStyle)
            updateTextColorStyle(newSettings.textColorNonUserStyle, false);
        if (newSettings.textSizeUserStyle)
            updateTextSizeStyle(newSettings.textSizeUserStyle, true);
        if (newSettings.textSizeNonUserStyle)
            updateTextSizeStyle(newSettings.textSizeNonUserStyle, false);
        if (newSettings.textWeightUserStyle)
            updateFontWeightStyle(newSettings.textWeightUserStyle, true);
        if (newSettings.textWeightNonUserStyle)
            updateFontWeightStyle(newSettings.textWeightNonUserStyle, false);
    }
});

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "change_color") {
        document.body.style.backgroundColor = request.color;
        sendResponse({ status: "Color changed" });
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
        "Request from Message Editor Sliders!: chrome.runtime.onMessage.addListener Callback",
    );
    if (request.action === "messageMaxWidthStyle")
        updateMessageMaxWidth(request.arg);
    else if (request.action === "messagePaddingStyle")
        updateMessagePadding(request.arg);
    else if (request.action === "messageBorderRadiusStyle")
        updateMessageBorderRadius(request.arg);
    else if (request.action === "inputBoxMaxWidthStyle")
        updateInputBoxMaxWidth(request.arg);
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});

loadSettings();
