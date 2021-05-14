import type { SpecTreeState } from '../types';
import { generateSlug } from '../utils/SlugUtils';

export default {
  touched: undefined,
  tree: [
    {
      key: generateSlug(),
      type: 'folder',
      expanded: true,
      title: 'New Project',
      notes: `---
### Start your new project here.
Click the title to edit the folder name or click the edit button to change this document.
`
    }
  ],
  undo: {},
  redo: {},
  renameKeys: {},
  selectedTreeIndex: 0,
  selectedNodeKey: undefined
} as SpecTreeState;
