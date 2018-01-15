import "whatwg-fetch";
import ChromePromise from "chrome-promise";

import { syncedItems } from "./store";
import { API_URL } from "../../env";

const chromep = new ChromePromise();
const baseApi = API_URL;
const sameBookmarks = (a, b) => a.title === b.title && a.url === b.url;

const merge = async (parent, items, removeItems) => {
  const children = parent.children || [];
  return Promise.all([
    ...items.map(async item => {
      const matchingChilds = children.filter(child =>
        sameBookmarks(child, item)
      );
      if (matchingChilds.length > 0) {
        return Promise.all(
          matchingChilds.map(async matchingChild =>
            merge(matchingChild, item.children, removeItems)
          )
        );
      } else {
        const newBookmark = await chromep.bookmarks.create({
          parentId: parent.id,
          title: item.title,
          url: item.url
        });

        return merge(newBookmark, item.children, removeItems);
      }
    }),
    ...children.map(async child => {
      const hasItem = items.find(item => sameBookmarks(child, item));
      if (removeItems && !hasItem) {
        return chromep.bookmarks.removeTree(child.id);
      }
    })
  ]);
};

export const syncToChrome = async chromeId => {
  const items = await syncedItems();
  return Promise.all(
    items.filter(item => item.chromeId === chromeId).map(async item => {
      const itemForest = await chromep.bookmarks.getSubTree(chromeId);
      const itemTree = itemForest[0];
      const newItem = await fetch(`${baseApi}/items/${item.id}`).then(resp =>
        resp.json()
      );

      await merge(itemTree, newItem.items, true);
    })
  );
};

export const updateFromChrome = async chromeId => {
  const items = await syncedItems();
  return Promise.all(
    items.filter(item => item.chromeId === chromeId).map(async item => {
      const subforest = await chromep.bookmarks.getSubTree(chromeId);
      const childs = subforest[0].children || [];
      const visitChild = child => {
        return {
          title: child.title,
          url: child.url,
          dateAdded: child.dateAdded,
          children: (child.children || []).map(visitChild)
        };
      };

      const body = {
        id: item.id,
        items: childs.map(visitChild)
      };

      return fetch(`${baseApi}/items/${item.id}`, {
        method: "put",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(body)
      });
    })
  );
};
