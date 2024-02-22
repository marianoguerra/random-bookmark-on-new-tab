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

    // Navigate the current tab to a random bookmark
    if (bookmarks.length > 0) {
      const randomBookmark =
        bookmarks[Math.floor(Math.random() * bookmarks.length)];
      browser.tabs.update(tab.id, { url: randomBookmark });
    }
  });
}

// Listen for when a new tab is created
browser.tabs.onCreated.addListener(openRandomBookmark);
