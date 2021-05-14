import type { Action, SpecNode, TagValue } from '../types';

export function addTagAction(node: SpecNode, values: { tag: string }): Action {
  const newTags: TagValue[] = [...(node.tags || [])];
  newTags.push({ type: 'text', name: values['tag'] });
  return {
    description: 'add a tag',
    type: 'SET_VALUE',
    payload: { node, key: 'tags', value: newTags }
  };
}

export default addTagAction;
