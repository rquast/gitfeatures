import type { Action, SpecNode } from '../types';

export function changeToggleConditionsAction(
  node: SpecNode,
  value: any
): Action {
  return {
    description: 'change toggle conditions',
    type: 'SET_VALUE',
    payload: { node, key: 'conditions', value }
  };
}

export default changeToggleConditionsAction;
