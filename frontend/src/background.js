import "@babel/polyfill";
import { syncedItems } from "./utils/store";
import { syncToChrome } from "./utils/remote";

chrome.alarms.create("sync", {
  when: 0,
  periodInMinutes: 10
});

chrome.alarms.onAlarm.addListener(async ({ name }) => {
  if (name !== "sync") {
    return;
  }

  console.log("sync");
  const items = await syncedItems();
  items.forEach(async item => {
    await syncToChrome(item.id);
  });
});
