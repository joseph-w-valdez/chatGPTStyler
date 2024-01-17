console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement('style');
document.head.appendChild(customStyle);

let messageMaxWidthStyle = '';
let messageColorUserStyle = ''; 
let messageColorNonUserStyle = '';
let messagePaddingStyle = ''; 
let messageBorderRadiusStyle = '';

let inputBoxMaxWidthStyle = '';

const updateAllStyles = () => {
    customStyle.textContent = messageMaxWidthStyle + messageColorUserStyle + messageColorNonUserStyle 
                              + messagePaddingStyle + messageBorderRadiusStyle + inputBoxMaxWidthStyle;
};

const updateMessageMaxWidth = (widthPercentage: number) => {
    messageMaxWidthStyle = `@media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
    updateAllStyles();
};

const updateMessageColor = (color: string, isUser: boolean) => {
    if (isUser) {
        messageColorUserStyle = `[data-testid]:nth-child(even) > * > * { background-color: ${color}; }`;
    } else {
        messageColorNonUserStyle = `[data-testid]:nth-child(odd) > * > * { background-color: ${color}; }`;
    }
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

const setDefaultSettings = () => {
    updateMessageMaxWidth(95)
    updateMessageColor('#3c6083', false)   
    updateMessageColor('#4e7645', true)   
    updateMessagePadding('10px');
    updateMessageBorderRadius('5px');
    updateInputBoxMaxWidth(70)
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
