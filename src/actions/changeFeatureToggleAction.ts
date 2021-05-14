import type { Action, SpecNode } from '../types';

export function changeFeatureToggleAction(node: SpecNode, value: any): Action {
  return {
    description: 'change feature toggle state',
    type: 'SET_VALUE',
    payload: { node, key: 'toggleState', value }
  };
}

export default changeFeatureToggleAction;
