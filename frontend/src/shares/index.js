import ChromePromise from "chrome-promise";
import delegate from "delegate";

import "./index.scss";
import { syncedItems, desyncItem } from "../utils/store";
import { nodesToMap, getParents } from "../utils/bookmark";
import { syncToChrome, updateFromChrome } from "../utils/remote";
import template from "./template";

const chromep = new ChromePromise();

export default class Shares {
  constructor() {
    this.el = document.querySelector(".shares-list");
    this.titleEl = document.querySelector(".shares .mdc-list-group__subheader");
    this.renderQueue = Promise.resolve();

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        this.scheduleRendering();
      }
    });

    this.scheduleRendering();

    const getChromeIdForButton = e => {
      return e.delegateTarget.dataset.chromeid.trim();
    };

    const animate = async (e, cb) => {
      const target = e.delegateTarget;
      if (target.classList.contains("disabled")) {
        return;
      }

      const cleanupHandler = () => {
        classes.remove("disabled");
        classes.remove("animation-in-progress");
        target.removeEventListener("webkitAnimationIteration", cleanupHandler);
      };

      const classes = target.classList;
      classes.add("animation-in-progress");
      classes.add("disabled");
      await cb();
      target.addEventListener("webkitAnimationIteration", cleanupHandler);
    };

    delegate(this.el, ".shares-push-button", "click", e => {
      const chromeId = getChromeIdForButton(e);
      animate(e, () => updateFromChrome(chromeId));
    });

    delegate(this.el, ".shares-remove-button", "click", e => {
      const chromeId = getChromeIdForButton(e);
      desyncItem(chromeId);
    });

    delegate(this.el, ".shares-sync-button", "click", e => {
      const chromeId = getChromeIdForButton(e);
      animate(e, () => syncToChrome(chromeId));
    });

    delegate(this.el, ".shares-element-uuid", "click", e => {
      const delegatee = e.delegateTarget;
      window.getSelection().selectAllChildren(delegatee);
    });
  }

  scheduleRendering() {
    this.renderQueue = this.renderQueue
      .then(() => this.render())
      .catch(e => console.error(e));
  }

  async render() {
    const createPath = (node, nodeMap) => {
      const parts = getParents(node, nodeMap);
      return parts.map(part => part.title);
    };

    const items = await syncedItems();
    const chromeIdToItem = items.reduce(
      (acc, item) =>
        Object.assign(acc, {
          [item.chromeId]: item
        }),
      {}
    );

    this.el.innerHTML = "";
    if (items.length === 0) {
      this.titleEl.style.display = "none";
      return;
    }

    this.titleEl.style.display = "block";
    const allNodes = await chromep.bookmarks.getTree();
    const nodeMap = nodesToMap(allNodes);
    const nodes = await Promise.all(
      Object.keys(chromeIdToItem).map(async key => {
        try {
          const value = await chromep.bookmarks.get(key);
          return value[0];
        } catch (e) {
          const removedBookmarkId = chromeIdToItem[key].id;
          return desyncItem(removedBookmarkId);
        }
      })
    );

    return Promise.all(
      nodes.filter(value => !!value).map(node => {
        const path = createPath(node, nodeMap);
        const syncItem = chromeIdToItem[node.id];
        const li = document.createElement("li");
        const updateSyncDisplay = true;
        li.className = "shares-list-element mdc-list-item";
        li.innerHTML = template({
          path,
          key: syncItem.id,
          shouldPush: updateSyncDisplay,
          chromeId: syncItem.chromeId
        });

        this.el.appendChild(li);
      })
    );
  }
}
