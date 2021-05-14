import type { Action } from '../types';
import { setSessionValue } from '../utils/SessionUtils';

export function nodeClickedAction(
  rowInfo: any,
  currentRepositoryURL?: string
): Action {
  if (currentRepositoryURL) {
    if (['folder', 'feature'].includes(rowInfo.node.type)) {
      setSessionValue(
        currentRepositoryURL,
        'lastSpecNodeKey',
        rowInfo.node.key
      );
    } else if (
      ['story', 'rule', 'example', 'question'].includes(rowInfo.node.type)
    ) {
      setSessionValue(currentRepositoryURL, 'lastMapNodeKey', rowInfo.node.key);
    } else if (rowInfo.node.type === 'map') {
      setSessionValue(
        currentRepositoryURL,
        'lastSpecNodeKey',
        rowInfo.node.key
      );
      setSessionValue(currentRepositoryURL, 'lastMapNodeKey', null);
    }
  }
  return { description: 'node click', type: 'NODE_CLICKED', payload: rowInfo };
}

export default nodeClickedAction;
