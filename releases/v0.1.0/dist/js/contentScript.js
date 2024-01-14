/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/contentScript.ts ***!
  \******************************/

console.log("Content script loaded.");
// changing the background color of the page
/* document.body.style.backgroundColor = '#343541'; */
var customStyle = document.createElement('style');
document.head.appendChild(customStyle);
var maxWidthStyle = '';
var chatBoxColorUserStyle = '';
var chatBoxColorNonUserStyle = '';
var chatBoxPaddingStyle = '';
var chatBoxBorderRadiusStyle = '';
var inputBoxMaxWidthStyle = '';
var updateStyles = function () {
    customStyle.textContent = maxWidthStyle + chatBoxColorUserStyle + chatBoxColorNonUserStyle
        + chatBoxPaddingStyle + chatBoxBorderRadiusStyle + inputBoxMaxWidthStyle;
};
var updateMaxWidth = function (widthPercentage) {
    maxWidthStyle = "@media (min-width: 1200px) { [data-testid] > * > * { max-width: ".concat(widthPercentage, "% } }");
    updateStyles();
};
var updateChatBoxColor = function (color, isUser) {
    if (isUser) {
        chatBoxColorUserStyle = "[data-testid]:nth-child(even) > * > * { background-color: ".concat(color, "; }");
    }
    else {
        chatBoxColorNonUserStyle = "[data-testid]:nth-child(odd) > * > * { background-color: ".concat(color, "; }");
    }
    updateStyles();
};
var updateChatBoxPadding = function (padding) {
    chatBoxPaddingStyle = "[data-testid] > * > * { padding: ".concat(padding, "; }");
    updateStyles();
};
var updateChatBoxBorderRadius = function (borderRadius) {
    chatBoxBorderRadiusStyle = "[data-testid] > * > * { border-radius: ".concat(borderRadius, "; }");
    updateStyles();
};
var updateInputBoxMaxWidth = function (widthPercentage) {
    inputBoxMaxWidthStyle = "@media (min-width: 1600px) {\n      form { max-width: ".concat(widthPercentage, "% !important; }\n    }");
    updateStyles();
};
// default settings
updateMaxWidth(95);
updateChatBoxColor('#3c6083', false);
updateChatBoxColor('#4e7645', true);
updateChatBoxPadding('10px');
updateChatBoxBorderRadius('5px');
updateInputBoxMaxWidth(70);
// listening for messages from the background script or popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'change_color') {
        document.body.style.backgroundColor = request.color;
        sendResponse({ status: 'Color changed' });
    }
});
// send a message to the background script if needed
chrome.runtime.sendMessage({ message: 'Content script active' }, function (response) {
    console.log(response.reply);
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGF0Z3B0LXN0eWxlci8uL3NyYy9jb250ZW50U2NyaXB0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUubG9nKFwiQ29udGVudCBzY3JpcHQgbG9hZGVkLlwiKTtcclxuXHJcbi8vIGNoYW5naW5nIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBwYWdlXHJcbi8qIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzNDM1NDEnOyAqL1xyXG5cclxuY29uc3QgY3VzdG9tU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGN1c3RvbVN0eWxlKTtcclxuXHJcbmxldCBtYXhXaWR0aFN0eWxlID0gJyc7XHJcbmxldCBjaGF0Qm94Q29sb3JVc2VyU3R5bGUgPSAnJzsgXHJcbmxldCBjaGF0Qm94Q29sb3JOb25Vc2VyU3R5bGUgPSAnJztcclxubGV0IGNoYXRCb3hQYWRkaW5nU3R5bGUgPSAnJzsgXHJcbmxldCBjaGF0Qm94Qm9yZGVyUmFkaXVzU3R5bGUgPSAnJztcclxubGV0IGlucHV0Qm94TWF4V2lkdGhTdHlsZSA9ICcnO1xyXG5cclxuY29uc3QgdXBkYXRlU3R5bGVzID0gKCkgPT4ge1xyXG4gICAgY3VzdG9tU3R5bGUudGV4dENvbnRlbnQgPSBtYXhXaWR0aFN0eWxlICsgY2hhdEJveENvbG9yVXNlclN0eWxlICsgY2hhdEJveENvbG9yTm9uVXNlclN0eWxlIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGNoYXRCb3hQYWRkaW5nU3R5bGUgKyBjaGF0Qm94Qm9yZGVyUmFkaXVzU3R5bGUgKyBpbnB1dEJveE1heFdpZHRoU3R5bGU7XHJcbn07XHJcblxyXG5jb25zdCB1cGRhdGVNYXhXaWR0aCA9ICh3aWR0aFBlcmNlbnRhZ2U6IG51bWJlcikgPT4ge1xyXG4gICAgbWF4V2lkdGhTdHlsZSA9IGBAbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7IFtkYXRhLXRlc3RpZF0gPiAqID4gKiB7IG1heC13aWR0aDogJHt3aWR0aFBlcmNlbnRhZ2V9JSB9IH1gO1xyXG4gICAgdXBkYXRlU3R5bGVzKCk7XHJcbn07XHJcblxyXG5jb25zdCB1cGRhdGVDaGF0Qm94Q29sb3IgPSAoY29sb3I6IHN0cmluZywgaXNVc2VyOiBib29sZWFuKSA9PiB7XHJcbiAgICBpZiAoaXNVc2VyKSB7XHJcbiAgICAgICAgY2hhdEJveENvbG9yVXNlclN0eWxlID0gYFtkYXRhLXRlc3RpZF06bnRoLWNoaWxkKGV2ZW4pID4gKiA+ICogeyBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTsgfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNoYXRCb3hDb2xvck5vblVzZXJTdHlsZSA9IGBbZGF0YS10ZXN0aWRdOm50aC1jaGlsZChvZGQpID4gKiA+ICogeyBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTsgfWA7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVTdHlsZXMoKTtcclxufTtcclxuXHJcbmNvbnN0IHVwZGF0ZUNoYXRCb3hQYWRkaW5nID0gKHBhZGRpbmc6IHN0cmluZykgPT4ge1xyXG4gICAgY2hhdEJveFBhZGRpbmdTdHlsZSA9IGBbZGF0YS10ZXN0aWRdID4gKiA+ICogeyBwYWRkaW5nOiAke3BhZGRpbmd9OyB9YDtcclxuICAgIHVwZGF0ZVN0eWxlcygpO1xyXG59O1xyXG5cclxuY29uc3QgdXBkYXRlQ2hhdEJveEJvcmRlclJhZGl1cyA9IChib3JkZXJSYWRpdXM6IHN0cmluZykgPT4ge1xyXG4gICAgY2hhdEJveEJvcmRlclJhZGl1c1N0eWxlID0gYFtkYXRhLXRlc3RpZF0gPiAqID4gKiB7IGJvcmRlci1yYWRpdXM6ICR7Ym9yZGVyUmFkaXVzfTsgfWA7XHJcbiAgICB1cGRhdGVTdHlsZXMoKTtcclxufTtcclxuXHJcbmNvbnN0IHVwZGF0ZUlucHV0Qm94TWF4V2lkdGggPSAod2lkdGhQZXJjZW50YWdlOiBudW1iZXIpID0+IHtcclxuICAgIGlucHV0Qm94TWF4V2lkdGhTdHlsZSA9IGBAbWVkaWEgKG1pbi13aWR0aDogMTYwMHB4KSB7XHJcbiAgICAgIGZvcm0geyBtYXgtd2lkdGg6ICR7d2lkdGhQZXJjZW50YWdlfSUgIWltcG9ydGFudDsgfVxyXG4gICAgfWA7XHJcbiAgICB1cGRhdGVTdHlsZXMoKTtcclxufVxyXG5cclxuLy8gZGVmYXVsdCBzZXR0aW5nc1xyXG51cGRhdGVNYXhXaWR0aCg5NSlcclxudXBkYXRlQ2hhdEJveENvbG9yKCcjM2M2MDgzJywgZmFsc2UpICAgXHJcbnVwZGF0ZUNoYXRCb3hDb2xvcignIzRlNzY0NScsIHRydWUpICAgXHJcbnVwZGF0ZUNoYXRCb3hQYWRkaW5nKCcxMHB4Jyk7XHJcbnVwZGF0ZUNoYXRCb3hCb3JkZXJSYWRpdXMoJzVweCcpO1xyXG51cGRhdGVJbnB1dEJveE1heFdpZHRoKDcwKVxyXG5cclxuLy8gbGlzdGVuaW5nIGZvciBtZXNzYWdlcyBmcm9tIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdCBvciBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXHJcbiAgKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSAnY2hhbmdlX2NvbG9yJykge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHJlcXVlc3QuY29sb3I7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7c3RhdHVzOiAnQ29sb3IgY2hhbmdlZCd9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBzZW5kIGEgbWVzc2FnZSB0byB0aGUgYmFja2dyb3VuZCBzY3JpcHQgaWYgbmVlZGVkXHJcbmNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgbWVzc2FnZTogJ0NvbnRlbnQgc2NyaXB0IGFjdGl2ZScgfSwgcmVzcG9uc2UgPT4ge1xyXG4gIGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlcGx5KTtcclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==