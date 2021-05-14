import type { Action } from '../types';

export function renameTreeKeyAction(
  oldValue: string,
  newValue: string
): Action {
  return {
    type: 'RENAME_TREE_KEY',
    payload: { old: oldValue, new: newValue }
  };
}

export default renameTreeKeyAction;
