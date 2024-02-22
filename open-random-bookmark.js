function openRandomBookmark(tab) {
  // Fetch all bookmarks
  browser.bookmarks.getTree().then((bookmarkItems) => {
    let bookmarks = [];
    function findBookmarks(item) {
      if (item.url) bookmarks.push(item.url);
      if (item.children) {
        item.children.forEach((child) => findBookmarks(child));
      }
    }
    bookmarkItems.forEach(findBookmarks);

    // Navigate the current tab to a random bookmark if there are any bookmarks
    if (bookmarks.length > 0) {
      const randomBookmark =
        bookmarks[Math.floor(Math.random() * bookmarks.length)];
      browser.tabs.update(tab.id, { url: randomBookmark });
    }
  });
}

function isEmptyTab(tab) {
  return tab.url === "about:newtab" || tab.url === "about:blank" ||
    tab.url === "about:home";
}

browser.tabs.onCreated.addListener((tab) => {
  if (isEmptyTab(tab)) {
    // Note that the tab's URL may not be given its
    // final value at the time this event fired. In particular, Firefox opens a new tab
    // with the URL "about:blank" before loading the new page into it. You can listen
    // to tabs.onUpdated events to be notified when a URL is set.

    // from: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated

    // since new empty tabs are created as completed and as empty and never fire an update event we can't tell by listening to onUpdated
    // we just wait a while and if still empty
    setTimeout(async () => {
      const newTab = await browser.tabs.get(tab.id);
      if (newTab.status === "complete" && isEmptyTab(newTab)) {
        openRandomBookmark(newTab);
      } else {
        console.log("after: not empty", newTab);
      }
    }, 500);
  } else {
    console.log("onCreated: not empty", tab);
  }
});
