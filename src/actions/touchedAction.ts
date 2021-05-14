import type { Action } from '../types';

export function touchedAction(isReset: boolean = false): Action {
  if (isReset) {
    return { type: 'TOUCHED', payload: undefined };
  } else {
    return { type: 'TOUCHED', payload: Date.now() };
  }
}

export default touchedAction;
