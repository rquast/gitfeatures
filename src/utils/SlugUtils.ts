import { getNodeByNodeKey } from './TreeUtils';
import { nanoid } from 'nanoid';

function generateSlug(): string {
  const slug = nanoid();
  if (!/^[A-Za-z\d](?:[A-Za-z\d_-]*[A-Za-z\d])?$/.test(slug)) {
    return generateSlug();
  } else {
    return slug;
  }
}

const isValidSlug = (slug: string, tree: any): boolean => {
  if (!/^[A-Za-z\d](?:[A-Za-z\d_-]*[A-Za-z\d])?$/.test(slug)) {
    throw new Error('Invalid slug format');
  }
  if (['specification', 'feature-toggles'].includes(slug)) {
    throw new Error(`Cannot use reserved word "${slug}" for slug`);
  }
  if (slug.startsWith('map-')) {
    throw new Error(`Slug cannot start with "map-"`);
  }
  return !!getNodeByNodeKey(slug, tree);
};

const parseTitleForSlug = (
  title: string,
  tree: any
): { title: string; slug?: string } | undefined => {
  title = title.trim();
  const parts: string[] = title.split('#');
  if (parts.length <= 1) {
    return { title };
  }

  const slug: string | undefined = parts.pop();
  if (slug) {
    isValidSlug(slug, tree);
    if (parts.join('#').trim().length === 0) {
      throw new Error('Must provide both a title and a slug');
    }
    return { title: parts.join('#').trim(), slug };
  }
};

const renameKey = (object: any, oldKey: string, newKey: string) => {
  const clone = Object.assign({}, object);
  const targetKey = clone[oldKey];
  delete clone[oldKey];
  clone[newKey] = targetKey;
  return clone;
};

export { isValidSlug, parseTitleForSlug, renameKey, generateSlug };
