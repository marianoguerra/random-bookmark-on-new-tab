async function openRandomBookmark(tab) {
  // Fetch all bookmarks
  const bookmarkItems = await browser.bookmarks.getTree(),
    t1 = Date.now(),
    bookmarks = [];

  function findBookmarks(item) {
    if (item.url) bookmarks.push(item.url);
    if (item.children) {
      item.children.forEach((child) => findBookmarks(child));
    }
  }
  bookmarkItems.forEach(findBookmarks);

  console.log("got bookmarks in", Date.now() - t1, "ms");

  // Navigate the current tab to a random bookmark if there are any bookmarks
  if (bookmarks.length > 0) {
    const bookmarkIndex = Math.floor(Math.random() * bookmarks.length),
      randomBookmark = bookmarks[bookmarkIndex];

    const newTab = await browser.tabs.get(tab.id);
    if (isEmptyTabAndComplete(newTab)) {
      console.log("loading bookmark", newTab, randomBookmark);
      browser.tabs.update(tab.id, { url: randomBookmark });
    } else {
      console.log("tab changed before loading bookmark", newTab);
    }
  }
}

function isEmptyTab(tab) {
  return tab.url === "about:newtab" || tab.url === "about:blank" ||
    tab.url === "about:home";
}

function isEmptyTabAndComplete(tab) {
  return tab.status === "complete" && isEmptyTab(tab);
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
      if (isEmptyTabAndComplete(newTab)) {
        openRandomBookmark(newTab);
      } else {
        console.log("after: not empty", newTab);
      }
    }, 200);
  } else {
    console.log("onCreated: not empty", tab);
  }
});
