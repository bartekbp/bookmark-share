import "@babel/polyfill";

import { autoInit } from "material-components-web";

import "normalize.css/normalize.css";
import "material-components-web/dist/material-components-web.css";
import "./material.scss";
import "./base.scss";

import BookmarkTree from "./bookmark-tree";
import Shares from "./shares";
import Share from "./share";
import Sync from "./sync";

const ready = () => {
  const bookmarkTree = new BookmarkTree();
  const shares = new Shares();
  const share = new Share({ bookmarkTree });
  const sync = new Sync({ bookmarkTree });
  autoInit();
};

document.addEventListener("DOMContentLoaded", ready);
