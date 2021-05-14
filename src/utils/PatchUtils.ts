import jsonpatch, { Operation } from 'fast-json-patch';
import type {
  AppState,
  MapTreesState,
  PatchFilter,
  SpecTreeState
} from '../types';

const removeKey = (k: string = '', { [k]: _, ...o }: any = {}) => o;
const removeKeys = (keys: string[] = [], o = {}) =>
  keys.reduce((r, k) => removeKey(k, r), o);

export const excludePaths = (state: any, paths: string[]) => {
  return removeKeys(paths, state);
};

export const includePaths = (state: any, paths: string[]) => {
  let filteredState: any = {};
  const stateKeys = Object.keys(state);
  paths.forEach((key: string) => {
    if (stateKeys.includes(key)) {
      filteredState[key] = state[key];
    }
  });
  return filteredState;
};

export const createAppStatePatch = (
  newState: AppState,
  oldState: AppState
): Operation[] => {
  return jsonpatch.compare(oldState, newState);
};

export const applyAppStatePatch = (state: AppState, patch: Operation[]) => {
  return jsonpatch.applyPatch(state, patch, false, false).newDocument;
};

export const createPatch = (
  newState: SpecTreeState | MapTreesState,
  oldState: SpecTreeState | MapTreesState,
  filter: PatchFilter = { excludePaths: [] }
): Operation[] => {
  if (filter && filter.includePaths) {
    return jsonpatch.compare(
      includePaths(newState, filter.includePaths),
      includePaths(oldState, filter.includePaths)
    );
  } else {
    filter.excludePaths = (filter.excludePaths || []).concat(['undo', 'redo']);
    return jsonpatch.compare(
      excludePaths(newState, filter.excludePaths),
      excludePaths(oldState, filter.excludePaths)
    );
  }
};

export const applyPatch = (
  state: SpecTreeState | MapTreesState,
  patch: Operation[]
) => {
  return jsonpatch.applyPatch(state, patch, false, false).newDocument;
};
