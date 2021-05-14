import type { Action, MapNode } from '../types';

export function createTreeAction(key: string, tree: MapNode[]): Action {
  return {
    description: 'create a tree',
    type: 'CREATE_TREE',
    payload: {
      key,
      state: { tree, selectedTreeIndex: 0, selectedNode: tree[0] }
    }
  };
}

export default createTreeAction;
