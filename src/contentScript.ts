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
let messageWidthContent = '';
let messageUserAutoMargin = '';
let messageNonUserAutoMargin = '';
let messageTextWidth = '';
let messageMaxContent = '';

const updateAllStyles = () => {
    customStyle.textContent = messageMaxWidthStyle + messageColorUserStyle + messageColorNonUserStyle 
                              + messagePaddingStyle + messageBorderRadiusStyle + inputBoxMaxWidthStyle 
                              + messageWidthContent + messageUserAutoMargin + messageNonUserAutoMargin
                              + messageTextWidth + messageMaxContent;
};

const updateMessageMaxContent = (widthPercentage: number) => {
    messageMaxContent = `[data-message-id] > * { max-width : ${widthPercentage}%; }`; 
    updateAllStyles();
}

const updateMessageWidthContent = (width: string) => {
    messageWidthContent = `[data-testid] > * > * { width: ${width}; }`;
    updateAllStyles();
}

type MarginOptions = {
    marginLeft?: 0 | string;
    marginRight?: 0 | string;
    isUser: boolean;
}

const updateMessageAutoMargin = (options: MarginOptions) => {
    const { marginLeft, marginRight, isUser } = options;

    if (isUser) {
        messageUserAutoMargin = `[data-testid]:nth-child(even) > * > * { margin-left: ${marginLeft}; margin-right: ${marginRight}; }`;
    } else {
        messageNonUserAutoMargin = `[data-testid]:nth-child(odd) > * > * { margin-right: ${marginRight}; margin-left: ${marginLeft}; }`;
    }
    updateAllStyles();
}

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

const updateMessageTextWidth = (width: string) => {
    messageTextWidth = `@media (min-width: 1600px) { form { width: ${width}; }
    }`;
    updateAllStyles();
}

const setDefaultSettings = () => {
    updateMessageMaxWidth(95)
    updateMessageColor('#3c6083', false)   
    updateMessageColor('#4e7645', true)   
    updateMessagePadding('10px');
    updateMessageBorderRadius('5px');
    updateInputBoxMaxWidth(70);
    updateMessageWidthContent('fit-content');
    updateMessageAutoMargin({ marginLeft: 'auto', marginRight: 0, isUser: true });
    updateMessageAutoMargin({ marginRight: 'auto', marginLeft: 0, isUser: false });
    updateMessageTextWidth('fit-content');
    updateMessageMaxContent(100);
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
