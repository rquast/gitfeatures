import type { Action, SpecNode, MapNode } from '../types';

export function setNodesAction(tree: SpecNode[] | MapNode[]): Action {
  return { description: 'tree change', type: 'SET_NODES', payload: tree };
}

export default setNodesAction;
