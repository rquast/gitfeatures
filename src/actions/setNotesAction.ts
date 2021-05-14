import type { Action, SpecNode } from '../types';

export function setNotesAction(node: SpecNode, value: string): Action {
  return {
    description: 'change document',
    type: 'SET_VALUE',
    payload: { node, key: 'notes', value }
  };
}

export default setNotesAction;
