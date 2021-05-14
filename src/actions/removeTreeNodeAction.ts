import type { Action, SpecNode, MapNode } from '../types';

export function removeTreeNodeAction(node: SpecNode | MapNode): Action {
  return {
    description: 'remove tree node',
    type: 'REMOVE_TREE_NODE',
    payload: node
  };
}

export default removeTreeNodeAction;
