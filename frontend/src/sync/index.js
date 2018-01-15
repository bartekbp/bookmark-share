import uuidv4 from "uuid/v4";

import { syncedItems, syncItem } from "../utils/store";
import "./index.scss";
import { syncToChrome } from "../utils/remote";
import { Selectable as ParentSelectable } from "../bookmark-tree";

class Selectable extends ParentSelectable {
  constructor(syncedItems) {
    super();
    this.syncedItems = syncedItems;
  }

  canSelect(node) {
    return (
      !this.syncedItems.includes(node.id) && (node.children || []).length === 0
    );
  }

  mapChildren(node, adaptFunction) {
    return adaptFunction(node.children, this);
  }

  cannotSelectReason() {
    return "Cannot sync to not empty folder";
  }
}

export default class Sync {
  constructor({ bookmarkTree }) {
    const shareButton = document.querySelector(".sync-add-button");
    const shareInput = document.querySelector(".sync-add-input");

    shareInput.addEventListener("keyup", e => {
      shareButton.disabled = e.target.value.trim() === "";
    });

    shareButton.addEventListener("click", async () => {
      const alreadySynced = (await syncedItems()).map(item => item.chromeId);
      const selectable = new Selectable(alreadySynced);

      bookmarkTree.select(async node => {
        const uuid = shareInput.value.trim();
        await syncItem({ chromeId: node.id, id: uuid });
        await syncToChrome(uuid);
        shareInput.value = "";
        shareButton.disabled = true;
      }, selectable);
    });
  }
}
