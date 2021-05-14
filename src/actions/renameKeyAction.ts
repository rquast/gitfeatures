import type { Action } from '../types';

export function renameKeyAction(
  oldValue: string,
  newValue: string,
  title: string
): Action {
  return {
    description: 'rename slug',
    type: 'RENAME_KEY',
    payload: { old: oldValue, new: newValue, title }
  };
}

export default renameKeyAction;
