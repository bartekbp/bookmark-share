import ChromePromise from "chrome-promise";
const chromep = new ChromePromise();

export const getParents = (bookmarkOrId, nodeMap) => {
  let tmp =
    typeof bookmarkOrId === "string" ? nodeMap[bookmarkOrId] : bookmarkOrId;
  const parents = [];
  while (tmp.parentId) {
    parents.push(tmp);
    tmp = nodeMap[tmp.parentId];
  }

  return parents.reverse();
};

export const nodesToMap = nodes => {
  const base = {};
  const addNodesToMap = nodes =>
    nodes.forEach(node => {
      base[node.id] = node;
      addNodesToMap(node.children || []);
    });

  addNodesToMap(nodes);
  return base;
};

export const getBookmarkParents = async id => {
  const bookmarks = await chromep.bookmarks.getTree();
  const nodeMap = nodesToMap(bookmarks);
  return getParents(id, nodeMap);
};

export const getAllBookmarks = async () => {
  const bookmarks = await chromep.bookmarks.getTree();
  const nodeMap = nodesToMap(bookmarks);
  return Object.values(nodeMap);
};
