console.log("Content script loaded.");

const customStyle = document.createElement("style");
document.head.appendChild(customStyle);

let messageMaxWidthStyle = "";
let messagePaddingStyle = "";
let messageBorderRadiusStyle = "";
let inputBoxMaxWidthStyle = "";
let messageBoxColors = "";
let selectionColors = "";
let chatMessageButtons = `
    [data-testid] button {
      visibility: unset
    }
`;
const codeSnippitWidth = `
    [data-testid] > * > * > *:nth-child(2) {
        width: 100%;
        max-width: calc(100% - 72px);
    }
`;

const updateMessageColor = (
    color: string,
    isUser: boolean,
    isDark: boolean,
) => {
    messageBoxColors = `
      .dark {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            isUser && isDark ? color : "#4e7645"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            !isUser && isDark ? color : "#3c6083"
        } }
      }
      .light {
        [data-testid]:nth-child(even) > * > * { background-color: ${
            isUser && !isDark ? color : "#62B1F6"
        } }
        [data-testid]:nth-child(odd) > * > * { background-color: ${
            !isUser && !isDark ? color : "#EEEEEE"
        } }
      }
    `;
    updateAllStyles();
};

const updateAllStyles = () => {
    customStyle.textContent =
        messageBoxColors +
        messageMaxWidthStyle +
        messagePaddingStyle +
        messageBorderRadiusStyle +
        inputBoxMaxWidthStyle +
        selectionColors +
        chatMessageButtons +
        codeSnippitWidth;
};

const updateMessageMaxWidth = (widthPercentage: number) => {
    messageMaxWidthStyle = `@media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
    updateAllStyles();
};

const updateMessagePadding = (padding: string) => {
    messagePaddingStyle = `[data-testid] > * > * { padding: ${padding}; }`;
    updateAllStyles();
};

const updateMessageBorderRadius = (borderRadius: string) => {
    messageBorderRadiusStyle = `[data-testid] > * > * { border-radius: ${borderRadius}; }`;
    updateAllStyles();
};

const updateInputBoxMaxWidth = (widthPercentage: number) => {
    inputBoxMaxWidthStyle = `@media (min-width: 1600px) {
      form { max-width: ${widthPercentage}% !important; }
    }`;
    updateAllStyles();
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

// Function to apply background color based on span text
function applyBackgroundToButton($chatGPTButton: HTMLDivElement) {
    const $span = $chatGPTButton.querySelector('span') as HTMLSpanElement;
    let backgroundColor = '#18C37D';
    let hoverColor = '#16A96B';

    if ($span) {
        const text = $span.textContent || '';
        if (text.includes('3.5')) {
            backgroundColor = '#18C37D';
            hoverColor = '#16A96B';
        } else if (text.includes('4')) {
            backgroundColor = '#AB68FF';
            hoverColor = '#9A58E6';
        }
    }

    // Create or get the style element
    let style = document.getElementById('staticCustomStyle') as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = 'staticCustomStyle';
        document.head.appendChild(style);
    }

    // Set the CSS in the style element
    style.textContent = `
        #chatGPTButton {
            background: ${backgroundColor};
        }
        #chatGPTButton:hover {
            background: ${hoverColor};
        }
        #chatGPTButton span {
            color: white;
        }
        #chatGPTButton svg {
            color: white;
        }
    `;
}

// Get the parent element
const $chatGPTButtonParent = document.querySelector('[role="presentation"] > div > div > div div > .flex.items-center.gap-2') as HTMLDivElement;

if ($chatGPTButtonParent) {
    // Create a MutationObserver to watch for new children
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const $chatGPTButton = mutation.addedNodes[0] as HTMLDivElement;
                $chatGPTButton.id = 'chatGPTButton';
                applyBackgroundToButton($chatGPTButton);

                // Create a MutationObserver to watch for changes in the text content of the span
                const $span = $chatGPTButton.querySelector('span');
                if ($span) {
                    const spanObserver = new MutationObserver(() => {
                        applyBackgroundToButton($chatGPTButton);
                    });
                    spanObserver.observe($span, { characterData: true, subtree: true });
                }
            }
        });
    });

    observer.observe($chatGPTButtonParent, { childList: true });
}

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
    updateMessagePadding("10px");
    updateMessageBorderRadius("5px");
    updateInputBoxMaxWidth(70);
    resetDefaultMessageColors();
};

// set default settings on load
setDefaultSettings();

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "change_color") {
        document.body.style.backgroundColor = request.color;
        sendResponse({ status: "Color changed" });
    }
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: "Content script active" }, (response) => {
    console.log(response.reply);
});
