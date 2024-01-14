console.log("Content script loaded.");

// changing the background color of the page
document.body.style.backgroundColor = '#343541';


const customStyle = document.createElement('style');
document.head.appendChild(customStyle);

const updateMaxWidth = (widthPercentage: number) => {
    customStyle.textContent = `[data-testid] > * > * { max-width: ${widthPercentage}%} }`
}

// default setting for 100% max width
updateMaxWidth(95)

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
