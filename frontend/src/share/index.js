import uuidv4 from "uuid/v4";

import "./index.scss";
import { syncedItems, syncItem } from "../utils/store";
import { Selectable as ParentSelectable } from "../bookmark-tree";

class Selectable extends ParentSelectable {
  constructor(syncedItems) {
    super();
    this.syncedItems = syncedItems;
  }

  canSelect(node) {
    return !this.syncedItems.includes(node.id);
  }

  mapChildren(node, adaptFunction) {
    return this.canSelect(node) ? adaptFunction(node.children, this) : [];
  }

  cannotSelectReason() {
    return "Already syncing item";
  }
}

export default class Share {
  constructor({ bookmarkTree }) {
    this.shareButton = document.querySelector(".share-bookmarks-button");

    this.shareButton.addEventListener("click", async () => {
      const alreadySynced = (await syncedItems()).map(item => item.chromeId);
      const selectable = new Selectable(alreadySynced);
      bookmarkTree.select(async node => {
        const uuid = uuidv4();
        await syncItem({ chromeId: node.id, id: uuid });
      }, selectable);
    });
  }
}
