import type { Action, SpecNode, MapNode } from '../types';

export function addTreeNodeAction(
  key: string,
  title: string,
  type: string,
  selectedNode: SpecNode | MapNode
): Action {
  return {
    description: 'add a ' + type,
    type: 'ADD_TREE_NODE',
    payload: { node: { key, title, type }, selectedNode }
  };
}

export default addTreeNodeAction;
