import type { GetTreeItemChildrenFn, TreeItem } from 'react-sortable-tree';
import type { FeatureToggles, MapNode, SpecNode } from '../types';

const immutableSetNodeProperty = function (
  tree: SpecNode[] | MapNode[],
  targetNode: SpecNode | MapNode,
  key: keyof SpecNode | keyof MapNode,
  value: string
): {
  cloneTree: SpecNode[] | MapNode[];
  cloneTargetNode: SpecNode | MapNode;
} {
  let cloneTargetNode;
  const cloneTree = JSON.parse(JSON.stringify(tree));
  const cloneNodes = getTreeNodesAsArray(cloneTree);

  for (const node of cloneNodes) {
    if (node.key === targetNode.key) {
      (node as { [key: string]: any })[key] = value;
      cloneTargetNode = node;
      break;
    }
  }

  if (typeof cloneTargetNode === 'undefined') {
    throw new Error('target node was undefined');
  }

  return { cloneTree, cloneTargetNode };
};

const immutableInsertNodeAfter = function (
  targetNode: SpecNode | MapNode,
  originalTree: SpecNode[] | MapNode[],
  insertNode: SpecNode | MapNode
): SpecNode[] | MapNode[] {
  const clonedTree: SpecNode[] | MapNode[] = [];

  // Only occurs when there are no nodes in a tree
  if (typeof targetNode === 'undefined') {
    clonedTree.push(insertNode);
    return clonedTree;
  }

  originalTree.forEach((originalNode: SpecNode | MapNode) => {
    const clonedNode = JSON.parse(JSON.stringify(originalNode));
    if (originalNode.children) {
      clonedNode.children = immutableInsertNodeAfter(
        targetNode,
        originalNode.children,
        insertNode
      );
    }
    clonedTree.push(clonedNode);

    // insert after the target node
    if (originalNode.key === targetNode.key) {
      // first check if it should be a child node, add as a child node if it should
      if (
        (insertNode.type === 'map' && targetNode.type === 'feature') ||
        (insertNode.type === 'feature' && targetNode.type === 'folder') ||
        (insertNode.type === 'rule' && targetNode.type === 'story') ||
        (insertNode.type === 'example' && targetNode.type === 'rule')
      ) {
        if (!clonedNode.children) {
          clonedNode.children = [];
        }
        clonedNode.children.push(insertNode);
      } else {
        clonedTree.push(insertNode);
      }
    }
  });
  return clonedTree;
};

const immutableTreeNodeFilterTargets = function (
  targetNode: SpecNode | MapNode,
  tree: SpecNode[] | MapNode[],
  isChild: boolean = false
): SpecNode[] | MapNode[] {
  let targets: SpecNode[] | MapNode[] = [];
  tree.forEach((node: SpecNode | MapNode) => {
    if (node.key === targetNode.key || isChild) {
      targets = targets.concat(node);
      if (node.children) {
        targets = targets.concat(
          immutableTreeNodeFilterTargets(targetNode, node.children, true)
        );
      }
    } else if (node.children) {
      targets = targets.concat(
        immutableTreeNodeFilterTargets(targetNode, node.children, false)
      );
    }
  });
  return targets;
};

const immutableNodeFilter = function (
  targetNode: SpecNode | MapNode,
  originalTree: SpecNode[] | MapNode[]
): SpecNode[] | MapNode[] {
  const clonedTree: SpecNode[] | MapNode[] = [];
  originalTree.forEach((originalNode: any) => {
    if (originalNode.key !== targetNode.key) {
      const clonedNode: SpecNode | MapNode = JSON.parse(
        JSON.stringify(originalNode)
      );
      if (originalNode.children) {
        clonedNode.children = immutableNodeFilter(
          targetNode,
          originalNode.children
        );
      }
      clonedTree.push(clonedNode);
    }
  });
  return clonedTree;
};

const immutableTreeKeyFilter = function (
  allowedKeys: string[],
  originalTree: SpecNode[] | MapNode[]
) {
  const clonedTree: SpecNode[] | MapNode[] | { [key: string]: any } = [];
  originalTree.forEach((originalNode: any) => {
    const clonedNode: SpecNode | MapNode | { [key: string]: any } = {};
    allowedKeys.forEach((key: string) => {
      if (typeof originalNode[key] !== 'undefined') {
        clonedNode[key] = JSON.parse(JSON.stringify(originalNode[key]));
      } else if (key === 'expanded') {
        clonedNode[key] = true;
      }
    });
    if (originalNode.children) {
      clonedNode.children = immutableTreeKeyFilter(
        allowedKeys,
        originalNode.children
      );
    }
    clonedTree.push(clonedNode);
  });
  return clonedTree;
};

const immutableFeatureToggles = function (originalTree: SpecNode[]) {
  let featureToggles: FeatureToggles = {};
  for (const node of originalTree) {
    const key = node.key;
    if (node.type === 'feature' && node.toggleState) {
      if (node.conditions || node.toggleState !== 'Disabled') {
        featureToggles[key] = {
          title: node.title + '',
          state: node.toggleState + '',
          conditions: (node.conditions || '') + ''
        };
      }
    }
    if (node.children) {
      featureToggles = {
        ...featureToggles,
        ...immutableFeatureToggles(node.children)
      };
    }
  }
  return featureToggles;
};

const getParentByNode = (
  targetNode: SpecNode | MapNode,
  tree: SpecNode[] | MapNode[],
  parent?: SpecNode | MapNode
): SpecNode | MapNode | undefined => {
  for (const node of tree) {
    if (node.key === targetNode.key) {
      return parent;
    } else if (node.children) {
      const result = getParentByNode(targetNode, node.children, node);
      if (result) {
        return result;
      }
    }
  }
};

const getTreeIndexByNode = (
  targetNode: TreeItem,
  tree: TreeItem[] | GetTreeItemChildrenFn,
  obj: any = { selectedIndex: -1, found: false }
): number => {
  if (typeof tree !== 'function') {
    for (const node of tree) {
      if (obj.found === true) {
        return obj.selectedIndex;
      }
      obj.selectedIndex++;
      if (node.key === targetNode.key) {
        obj.found = true;
        return obj.selectedIndex;
      }
      if (!node.expanded) {
        continue;
      }
      if (node.children) {
        getTreeIndexByNode(targetNode, node.children, obj);
      }
    }
  }
  return obj.selectedIndex;
};

const getNodeByNodeKey = (
  key: string,
  tree: SpecNode[] | MapNode[]
): SpecNode | MapNode | undefined => {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const childNode = getNodeByNodeKey(key, node.children);
      if (childNode) {
        return childNode;
      }
    }
  }
};

const getTreeNodesAsArray = (
  tree: SpecNode[] | MapNode[]
): SpecNode[] | MapNode[] => {
  let nodes: SpecNode[] | MapNode[] = [];
  tree.forEach((node: SpecNode | MapNode) => {
    nodes.push(node);
    if (node.children && node.children.length > 0) {
      nodes = nodes.concat(getTreeNodesAsArray(node.children));
    }
  });
  return nodes;
};

export {
  immutableSetNodeProperty,
  getParentByNode,
  immutableNodeFilter,
  immutableTreeNodeFilterTargets,
  immutableInsertNodeAfter,
  getTreeIndexByNode,
  immutableTreeKeyFilter,
  immutableFeatureToggles,
  getNodeByNodeKey,
  getTreeNodesAsArray
};
