import {
  getNodeByNodeKey,
  getTreeIndexByNode,
  immutableInsertNodeAfter,
  immutableNodeFilter,
  immutableSetNodeProperty
} from '../utils/TreeUtils';
import { applyPatch, createPatch } from '../utils/PatchUtils';
import folderStub from '../stubs/folderNodeStub';
import type { Action, SpecTreeState } from '../types';
import { nanoid } from 'nanoid';

const reducer = (state: any, action: Action) => {
  switch (action.type) {
    case 'CLEAR_UNDO':
      return {
        ...state,
        undo: {},
        redo: {}
      };
    case 'ADD_UNDO':
      return {
        ...state,
        undo: {
          ...state.undo,
          [action.payload.patchKey]: action.payload.patch
        },
        redo: {}
      };
    case 'REMOVE_UNDO':
      const undoClone = JSON.parse(JSON.stringify(state.undo));
      delete undoClone[action.payload.patchKey];
      return {
        ...state,
        undo: undoClone
      };
    case 'UNDO':
      if (action.payload.patchKey && state.undo[action.payload.patchKey]) {
        const patch = state.undo[action.payload.patchKey];
        const newState = applyPatch(state, patch);
        delete newState.undo[action.payload.patchKey];
        newState.redo[action.payload.patchKey] = createPatch(newState, state);
        return newState;
      } else {
        return state;
      }
    case 'REDO':
      if (action.payload.patchKey && state.redo[action.payload.patchKey]) {
        const patch = state.redo[action.payload.patchKey];
        const newState = applyPatch(state, patch);
        delete newState.redo[action.payload.patchKey];
        newState.undo[action.payload.patchKey] = createPatch(newState, state);
        return newState;
      } else {
        return state;
      }
    case 'SET_RENAME_KEYS':
      return {
        ...state,
        renameKeys: { ...(action.payload || {}) }
      };
    case 'RELOAD':
      const reloadState: SpecTreeState = {
        ...state,
        touched: undefined,
        tree: undefined,
        undo: {},
        redo: {},
        renameKeys: {}
      };
      if (action.payload.isReset) {
        reloadState.selectedNodeKey = undefined;
        reloadState.selectedTreeIndex = 0;
      }
      return reloadState;
    case 'TOUCHED':
      return { ...state, touched: action.payload };
    case 'NODE_CLICKED':
      return {
        ...state,
        selectedTreeIndex: action.payload.treeIndex,
        selectedNodeKey: action.payload.node.key + ''
      };
    case 'SET_VALUE':
      const { cloneTree } = immutableSetNodeProperty(
        state.tree,
        action.payload.node,
        action.payload.key,
        JSON.parse(JSON.stringify(action.payload.value))
      );
      return {
        ...state,
        tree: cloneTree
      };
    case 'SET_NODES':
      return { ...state, tree: [...action.payload] };
    case 'ADD_TREE_NODE':
      const node = {
        ...JSON.parse(JSON.stringify(folderStub)),
        ...JSON.parse(JSON.stringify(action.payload.node))
      };
      const tree = immutableInsertNodeAfter(
        action.payload.selectedNode,
        state.tree,
        node
      );
      const selectedTreeIndex = getTreeIndexByNode(node, tree);
      return { ...state, tree, selectedTreeIndex, selectedNodeKey: node.key };
    case 'REMOVE_TREE_NODE':
      const clone = immutableNodeFilter(action.payload, state.tree);
      return {
        ...state,
        tree: clone,
        selectedNodeKey: clone[0]?.key,
        selectedTreeIndex: 0
      };
    case 'RENAME_KEY':
      const renameTreeClone = JSON.parse(JSON.stringify(state.tree));
      const targetNode = getNodeByNodeKey(
        action.payload.old + '',
        renameTreeClone
      );
      if (!targetNode) {
        return state;
      }
      targetNode.key = action.payload.new + '';
      if (action.payload.title) {
        targetNode.title = action.payload.title + '';
      }
      const renameKeys = { ...(state.renameKeys || {}) };
      let foundExistingKey = false;
      for (const renameKey of Object.keys(renameKeys)) {
        // does one of the existing new values equal the old key name ?
        if (renameKeys[renameKey] === action.payload.old) {
          // if so, update the existing value to be the new key name
          renameKeys[renameKey] = action.payload.new + '';
          foundExistingKey = true;
          break;
        }
      }
      if (!foundExistingKey) {
        renameKeys[action.payload.old + ''] = targetNode.key + '';
      }
      return {
        ...state,
        tree: renameTreeClone,
        renameKeys,
        selectedNodeKey: targetNode.key + ''
      };
    default:
      return state;
  }
};

export default reducer;
