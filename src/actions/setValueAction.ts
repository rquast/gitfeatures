import type { Action, SpecNode, MapNode } from '../types';

export function setValueAction(
  node: SpecNode | MapNode,
  key: string,
  value: any
): Action {
  return {
    description: 'change ' + key,
    type: 'SET_VALUE',
    payload: { node, key, value }
  };
}

export default setValueAction;
