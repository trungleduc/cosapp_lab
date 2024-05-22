import { getNodeAtPath, walk } from 'react-sortable-tree';

/**
 *
 * Helper function to call `fn` each `ms` millisecond
 * @export
 * @param {*} fn
 * @param {*} ms
 * @param {*} number
 * @returns {*}
 */

export function debounce(fn: any, ms: number): any {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, ms);
  };
}

/**
 *
 *
 * @export
 * @param {*} treeData
 * @param {number[]} path
 * @returns
 */
export function getNodeFullPath(treeData: any, path: number[]) {
  const getNodeKey = (obj: { treeIndex: any }) => obj.treeIndex;
  let fullPath: string;
  for (let index = 0; index < path.length; index++) {
    const newPath = path.slice(0, index + 1);
    const currentNode = getNodeAtPath({
      treeData: treeData,
      path: newPath,
      getNodeKey: getNodeKey
    });
    const currentTitle = currentNode.node.title;
    if (index == 0) {
      fullPath = currentTitle as string;
    } else {
      fullPath = fullPath.concat('.' + currentTitle);
    }
  }
  return fullPath;
}

export function updateNodeId(treeData: any, oldId: string, newId: string) {
  const getNodeKey = (obj: { treeIndex: any }) => obj.treeIndex;
  const ret = {};
  const callback = item => {
    const nodeId: string = item.node.id;
    if (nodeId.startsWith(oldId)) {
      const newNodeId = nodeId.replace(oldId, newId);
      item.node.id = newNodeId;
      ret[nodeId] = newNodeId;
    }
  };
  walk({ treeData, getNodeKey, callback });

  return ret;
}
