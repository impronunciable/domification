// Unique ID for the className.
const MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
const ELEMENT_CHANGED_CLASSNAME = 'elm_changed';

let enabled = false;
let observer, targetElem;

// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;

// Highlights the DOM element when the mouse moves
var highlightFunc = function (e) {
  var srcElement = e.srcElement;

    // For NPE checking, we check safely. We need to remove the class name
    // Since we will be styling the new one after.
    if (prevDOM != null) {
      prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }

    // Add a visited class name to the element. So we can style it.
    srcElement.classList.add(MOUSE_VISITED_CLASSNAME);

    // The current element is now the previous. So we can remove the class
    // during the next iteration.
    prevDOM = srcElement;
}

// Whenever the user clicks something, create an observer that will
// notify background so the notification can be triggered.
var selectFunc = function (e) {
  // Don't perform the default action on the element.
  e.preventDefault();

  // After selecting the elemtn, disable the extension.
  removeListeners();
  enabled = false;
  // Only 1 observer supported to start.
  if (observer) {
    observer.disconnect();
    targetElem.classList.remove(ELEMENT_CHANGED_CLASSNAME);
  }

  targetElem = e.srcElement;
  observer = new MutationObserver(function() {
    chrome.runtime.sendMessage({ type: 'notification', element: targetElem });

    // Disconnect the observer temporarily so we can set the class name
    // to avoid triggering and endless loop.
    observer.disconnect();
    targetElem.classList.add(ELEMENT_CHANGED_CLASSNAME);
    observer.observe(targetElem, { childList: true, subtree: true, characterData: true, attributes: true });

  });
  observer.observe(targetElem, { childList: true, subtree: true, characterData: true, attributes: true });

}

var addListeners = function() {
  document.addEventListener('mousemove', highlightFunc, false);
  document.addEventListener('click', selectFunc, false);
}

var removeListeners = function() {
  document.removeEventListener('mousemove', highlightFunc, false);
  document.removeEventListener('click', selectFunc, false);
  if (prevDOM != null) {
    prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
  }
}

// Every time we get a new message toggle the plugin
chrome.runtime.onMessage.addListener(function(request) {
  if (request.type == 'toggle') {
    // Remove any previous observers listeners if there are any;
    if (observer) {
      observer.disconnect();
      targetElem.classList.remove(ELEMENT_CHANGED_CLASSNAME);
    }
    if (enabled) {
      removeListeners();
    } else {
      addListeners();
    }
    enabled = !enabled;
  }
});
