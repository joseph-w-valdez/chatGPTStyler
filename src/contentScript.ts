// contentScript.ts

// This script runs in the context of web pages

console.log("Content script loaded.");

// Example: Changing the background color of the page
document.body.style.backgroundColor = '#343541';

// Example: Listening for messages from the background script or popup
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === 'change_color') {
      document.body.style.backgroundColor = request.color;
      sendResponse({status: 'Color changed'});
    }
});

// Send a message to the background script if needed
chrome.runtime.sendMessage({ message: 'Content script active' }, response => {
  console.log(response.reply);
});
