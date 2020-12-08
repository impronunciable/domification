// Unique ID for the className.
const MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
const ELEMENT_CHANGED_CLASSNAME = 'elm_changed';

let enabled = false;
let observer, targetElem, DOMObserver;
let targetParents = [];

// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;

var deletedElementsComponent = document.createElement('div');
deletedElementsComponent.classList.add('deleted-nav');

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


// getTargetParents stores the selected element hierarchy
// so it can be compared later to highlight the last existing
// parent.
var getTargetParents = function(element) {
  let p = [];
  let parent = element.parentElement;
  while(parent) {
    p.push(parent);
    parent = parent.parentElement;
  }

  return p
}

// Whenever the user clicks something, create an observer that will
// notify background so the notification can be triggered.
var selectFunc = function (e) {
  // Don't perform the default action on the element.
  e.preventDefault();

  // After selecting the element, disable the extension.
  removeListeners();
  enabled = false;

  // Only 1 observer supported to start.
  if (observer) {
    observer.disconnect();
    DOMObserver.disconnect();
    targetElem.classList.remove(ELEMENT_CHANGED_CLASSNAME);
  }

  targetElem = e.srcElement;
  targetParents = getTargetParents(e.srcElement);

  observer = new MutationObserver(function() {
    chrome.runtime.sendMessage({ type: 'notification', element: targetElem });

    // Disconnect the observer temporarily so we can set the class name
    // to avoid triggering and endless loop.
    observer.disconnect();
    targetElem.classList.add(ELEMENT_CHANGED_CLASSNAME);
    observer.observe(targetElem, { childList: true, subtree: true, characterData: true, attributes: true });

  });

  observer.observe(targetElem, { childList: true, subtree: true, characterData: true, attributes: true });

  DOMObserver = new MutationObserver(function(mutations) {
    for (const m of mutations) {
      // A removal happened in the DOM, let's
      // check if our element was removed.
      if (m.removedNodes.length > 0) {

        if (!document.body.contains(targetElem)) {

          chrome.runtime.sendMessage({ type: 'notification', element: targetElem });

          // Disconnect the DOM observer otherwise we'll get notified
          // for each change on the DOM.
          DOMObserver.disconnect()


          // Traverse up the target parents until we find the first element
          // that hasn't been removed and highlight it.

          for (let p of targetParents) {
            if(document.body.contains(p)) {
              p.classList.add(ELEMENT_CHANGED_CLASSNAME);
              break;
            }
          }
        }
      }
    }
  });
  DOMObserver.observe(document.body, { childList: true, subtree: true });

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
      DOMObserver.disconnect();
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
