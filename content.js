var observer = new MutationObserver(function(mutations) {
  chrome.runtime.sendMessage({ type: 'notification' });
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });
