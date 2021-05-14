import type { MapNode } from '../types';
import { generateSlug } from '../utils/SlugUtils';

export default [
  {
    key: generateSlug(),
    type: 'story',
    expanded: true,
    title: 'Add your first story here ...'
  }
] as MapNode[];
