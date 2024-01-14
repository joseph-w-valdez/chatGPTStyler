console.log("Content script loaded.");

// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */

const customStyle = document.createElement('style');
document.head.appendChild(customStyle);

let maxWidthStyle = '';
let chatBoxColorUserStyle = ''; 
let chatBoxColorNonUserStyle = '';
let chatBoxPaddingStyle = ''; 
let chatBoxBorderRadiusStyle = '';
let inputBoxMaxWidthStyle = '';

const updateStyles = () => {
    customStyle.textContent = maxWidthStyle + chatBoxColorUserStyle + chatBoxColorNonUserStyle 
                              + chatBoxPaddingStyle + chatBoxBorderRadiusStyle + inputBoxMaxWidthStyle;
};

const updateMaxWidth = (widthPercentage: number) => {
    maxWidthStyle = `@media (min-width: 1200px) { [data-testid] > * > * { max-width: ${widthPercentage}% } }`;
    updateStyles();
};

const updateChatBoxColor = (color: string, isUser: boolean) => {
    if (isUser) {
        chatBoxColorUserStyle = `[data-testid]:nth-child(even) > * > * { background-color: ${color}; }`;
    } else {
        chatBoxColorNonUserStyle = `[data-testid]:nth-child(odd) > * > * { background-color: ${color}; }`;
    }
    updateStyles();
};

const updateChatBoxPadding = (padding: string) => {
    chatBoxPaddingStyle = `[data-testid] > * > * { padding: ${padding}; }`;
    updateStyles();
};

const updateChatBoxBorderRadius = (borderRadius: string) => {
    chatBoxBorderRadiusStyle = `[data-testid] > * > * { border-radius: ${borderRadius}; }`;
    updateStyles();
};

const updateInputBoxMaxWidth = (widthPercentage: number) => {
    inputBoxMaxWidthStyle = `@media (min-width: 1600px) {
      form { max-width: ${widthPercentage}% !important; }
    }`;
    updateStyles();
}

// default settings
updateMaxWidth(95)
updateChatBoxColor('#3c6083', false)   
updateChatBoxColor('#4e7645', true)   
updateChatBoxPadding('10px');
updateChatBoxBorderRadius('5px');
updateInputBoxMaxWidth(70)

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
