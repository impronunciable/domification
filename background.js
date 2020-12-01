const notificationTab = {};

chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log(sender)
  if (request.type == 'notification') {
    const notId = 'notification' + Math.random();
    notificationTab[notId] = sender.tab.id;
    chrome.notifications.create(notId, {
      type: 'basic',
      title: 'Change in ' + sender.tab.title,
      message: sender.tab.url,
      iconUrl: 'chrome://favicon/size/48@1x/' + sender.tab.url,
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'toggle':
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle' });
      });
      break;
  }
});

chrome.notifications.onClicked.addListener(function callback(notificationId) {
  var updateProperties = { 'active': true };
  chrome.tabs.update(notificationTab[notificationId], updateProperties);
  chrome.notifications.clear(notificationId);
  window.focus();
});
