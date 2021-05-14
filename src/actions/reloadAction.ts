import type { Action } from '../types';

export function reloadAction(isReset: boolean = false): Action {
  return { type: 'RELOAD', payload: { isReset } };
}

export default reloadAction;
