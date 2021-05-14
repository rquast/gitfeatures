import { useContext, useCallback } from 'react';
import { getTreeIndexByNode, getTreeNodesAsArray } from '../utils/TreeUtils';
import { store as specificationStore } from '../context/SpecificationContext';
import { store as exampleMapStore } from '../context/ExampleMapContext';
import nodeClickedAction from '../actions/nodeClickedAction';
import changeSelectedTreeAction from '../actions/changeSelectedTreeAction';
import type { MapNode, SpecNode } from '../types';
import useAppState from './useAppState';
import { getSessionValue } from '../utils/SessionUtils';

function getSelectedNode(
  tree: SpecNode[] | MapNode[],
  key: string | null
): { node: SpecNode | MapNode; treeIndex: number } {
  let node: SpecNode = tree[0];
  let treeIndex = 0;

  if (key) {
    const nodes: SpecNode[] | MapNode[] = getTreeNodesAsArray(tree);
    for (const treeNode of nodes) {
      if (treeNode.key === key && treeNode.expanded) {
        node = treeNode;
        treeIndex = getTreeIndexByNode(node, tree);
        break;
      }
    }
  }

  return { node, treeIndex };
}

const useSelectNode = () => {
  const { currentRepositoryURL } = useAppState();
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  return useCallback(() => {
    if (
      !specificationContext.state.selectedNodeKey &&
      specificationContext.state.tree &&
      currentRepositoryURL
    ) {
      if (!specificationContext.state.tree[0]) {
        return;
      }
      // search for a previous node
      const lastSpecNodeKey = getSessionValue(
        currentRepositoryURL,
        'lastSpecNodeKey'
      );
      const lastMapNodeKey = getSessionValue(
        currentRepositoryURL,
        'lastMapNodeKey'
      );
      const { node: specNode, treeIndex: specTreeIndex } = getSelectedNode(
        specificationContext.state.tree,
        lastSpecNodeKey
      );

      // try and find it in the tree
      specificationContext.dispatch(
        nodeClickedAction({ node: specNode, treeIndex: specTreeIndex })
      );
      if (specNode.type === 'map') {
        exampleMapContext.dispatch(changeSelectedTreeAction(specNode.key));
        if (
          exampleMapContext.state.trees &&
          exampleMapContext.state.trees[specNode.key]
        ) {
          const mapTree = exampleMapContext.state.trees[specNode.key].tree;
          exampleMapContext.dispatch(
            nodeClickedAction(getSelectedNode(mapTree, lastMapNodeKey))
          );
        }
      }
    }
  }, [specificationContext.state, currentRepositoryURL]);
};

export default useSelectNode;
