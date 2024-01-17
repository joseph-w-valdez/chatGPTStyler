console.log("Content script loaded.");

const customStyle = document.createElement('style');
document.head.appendChild(customStyle);

let messageMaxWidthStyle = '';
let messagePaddingStyle = ''; 
let messageBorderRadiusStyle = '';
let inputBoxMaxWidthStyle = '';
let messageBoxColors = '';

const updateMessageColor = (color: string, isUser: boolean, isDark: boolean) => {
    messageBoxColors = `
      @media (prefers-color-scheme: light) {
        [data-testid]:nth-child(even) > * > * { background-color: ${isUser && !isDark ? color : '#62B1F6'} }
        [data-testid]:nth-child(odd) > * > * { background-color: ${!isUser && !isDark ? color : '#EEEEEE'} }
      }
      @media (prefers-color-scheme: dark) {
        [data-testid]:nth-child(even) > * > * { background-color: ${isUser && isDark ? color : '#4e7645'} }
        [data-testid]:nth-child(odd) > * > * { background-color: ${!isUser && isDark ? color : '#3c6083'} }
      }
    `;
    updateAllStyles();
};

const updateAllStyles = () => {
    customStyle.textContent = messageBoxColors + messageMaxWidthStyle + messagePaddingStyle 
                              + messageBorderRadiusStyle + inputBoxMaxWidthStyle;
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
}

const resetDefaultMessageColors = () => {
  messageBoxColors = `
  @media (prefers-color-scheme: light) {
    [data-testid]:nth-child(even) > * > * { background-color: #62B1F6 }
    [data-testid]:nth-child(odd) > * > * { background-color: #EEEEEE }
  }
  @media (prefers-color-scheme: dark) {
    [data-testid]:nth-child(even) > * > * { background-color: #4e7645 }
    [data-testid]:nth-child(odd) > * > * { background-color: #3c6083 }
  }
`;
updateAllStyles();
}

const setDefaultSettings = () => {
    updateMessageMaxWidth(95);
    updateMessagePadding('10px');
    updateMessageBorderRadius('5px');
    updateInputBoxMaxWidth(70);
    resetDefaultMessageColors();
}

// set default settings on load
setDefaultSettings()

// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === 'change_color') {
      document.body.style.backgroundColor = request.color;
      sendResponse({status: 'Color changed'});
    }
});

// send a message to the background script if needed
chrome.runtime.sendMessage({ message: 'Content script active' }, response => {
  console.log(response.reply);
});
