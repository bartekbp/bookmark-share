import ChromePromise from "chrome-promise";
import InspireTree from "inspire-tree";
import InspireTreeDOM from "inspire-tree-dom";
import "inspire-tree-dom/dist/inspire-tree-light.css";

import "./index.scss";

const chromep = new ChromePromise();

export class Selectable {
  canSelect(node) {
    throw new Error("Not implemented");
  }

  mapChildren(node, adaptFunction) {
    throw new Error("Not implemented");
  }

  cannotSelectReason() {
    throw new Error("Not implemented");
  }
}

const adaptNodes = (nodes, selectable = () => true) => {
  return nodes
    .filter(node => {
      return node.children;
    })
    .map(node =>
      Object.assign({}, node, {
        text: _.truncate(node.title, { length: 20 }),
        itree: {
          state: {
            selectable: node.id !== "0" && selectable.canSelect(node)
          },
          li: {
            attributes: {
              notSelectable: !selectable.canSelect(node),
              title: selectable.canSelect(node)
                ? ""
                : selectable.cannotSelectReason()
            }
          }
        },
        children: selectable.mapChildren(node, adaptNodes)
      })
    );
};

const getAdaptedBookmarks = async selector => {
  const tree = await chromep.bookmarks.getTree();
  return adaptNodes(tree, selector);
};

export default class BookmarkTree {
  constructor() {
    this.el = document.querySelector(".bookmarks-tree");
    this.container = document.querySelector(".container");
    this.button = document.querySelector(".bookmarks-go-back");
    this.onNodeSelected = () => undefined;
    this.tree = new InspireTree({
      data: []
    });

    new InspireTreeDOM(this.tree, {
      target: this.el
    });

    this.tree.on("node.selected", node => {
      this.onNodeSelected(node);
      this.hide();
      this.onNodeSelected = () => undefined;
    });

    this.button.addEventListener("click", () => this.hide());
    this.hide();
  }

  select(onNodeSelected, selector) {
    this.el.style.display = "block";
    this.button.style.display = "block";
    this.hideContainer();
    requestAnimationFrame(async () => {
      this.tree.removeAll();
      await this.tree.load(getAdaptedBookmarks(selector));
      this.tree.collapseDeep();
      this.tree.expand();
      this.onNodeSelected = onNodeSelected;
    });
  }

  hide() {
    this.el.style.display = "none";
    this.button.style.display = "none";
    this.showContainer();
  }

  hideContainer() {
    this.container.style.display = "none";
  }

  showContainer() {
    this.container.style.display = "flex";
  }
}
