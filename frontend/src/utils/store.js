import ChromePromise from "chrome-promise";

import { fetchBookmarks } from "./remote";

const chromep = new ChromePromise();

// list of {id, chromeId}
export const syncedItems = async () =>
  chromep.storage.local.get("items").then(({ items: items = [] }) => items);

export const syncItem = async item => {
  const items = await syncedItems();
  const equalItem = items.find(it => it.chromeId === item.chromeId);
  if (equalItem) {
    throw new Error("Already has item for that folder");
  }

  return chromep.storage.local.set({ items: [item, ...items] });
};

export const desyncItem = async desyncChromeId => {
  const items = await syncedItems();
  return chromep.storage.local.set({
    items: items.filter(item => item.chromeId !== desyncChromeId)
  });
};
