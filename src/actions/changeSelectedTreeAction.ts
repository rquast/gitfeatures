import type { Action } from '../types';

export function changeSelectedTreeAction(key: string): Action {
  return {
    description: 'change selected tree',
    type: 'CHANGE_SELECTED_TREE',
    payload: key
  };
}

export default changeSelectedTreeAction;
