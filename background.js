const id = 'domification-menu';

chrome.contextMenus.create({title: 'Domification - Observe tab changes', id: id}, function() {
  if (chrome.extension.lastError) {
    console.log('Got expected error: ' + chrome.extension.lastError.message);
    }
});

chrome.contextMenus.onClicked.addListener(function (obj) {
  if (obj.menuItemId !== id) return;
  chrome.tabs.executeScript({
    file: 'content.js'
  });
  const notId = 'start' + Math.random();
  const c = chrome.notifications.create(notId, {
    type: 'basic',
    title: 'Started tracking changed in this tab',
    message: '',
    iconUrl: chrome.extension.getURL('icon.png'),
  });
  c.onclick = () => {
    window.focs()
    this.close();
  }
});

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

chrome.notifications.onClicked.addListener(function callback(notificationId) {
  var updateProperties = { 'active': true };
  chrome.tabs.update(notificationTab[notificationId], updateProperties);
  chrome.notifications.clear(notificationId);
});
