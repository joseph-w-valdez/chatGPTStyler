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
};

const updateMessageMaxWidth = (widthPercentage: number) => {
    messageMaxWidthStyle = `@media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
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
        chatMessageButtons;
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
  }
  .light {
    [data-testid]:nth-child(even) > * > * { background-color: #62B1F6 }
    [data-testid]:nth-child(odd) > * > * { background-color: #EEEEEE }
  }
`;
};

// updates the text color and background color of highlighted/selected text. first selector targets user messages. second selector targets received messages
const updateSelectionColors = (textColor: string, isUser: boolean) => {
    selectionColors = `
    [data-message-id] > *::selection { background-color: ${
        isUser ? getComplementaryColor(textColor) : "black"
    }; color: ${isUser ? textColor : "white"} }
    [data-message-id] > * *::selection { background-color: ${
        !isUser ? getComplementaryColor(textColor) : "black"
    }; color: ${!isUser ? textColor : "white"} }
  `;
    updateAllStyles();
};

const setDefaultSettings = () => {
    updateMessageMaxWidth(95);
    updateMessagePadding("10px");
    updateMessageBorderRadius("5px");
    updateInputBoxMaxWidth(70);
    resetDefaultMessageColors();
};

const getComplementaryColor = (color = "") => {
    const colorPart = color.slice(1);
    const ind = parseInt(colorPart, 16);
    let iter = ((1 << (4 * colorPart.length)) - 1 - ind).toString(16);
    while (iter.length < colorPart.length) {
        iter = "0" + iter;
    }
    return "#" + iter;
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
