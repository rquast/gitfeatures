import {
  getTreeIndexByNode,
  immutableInsertNodeAfter,
  immutableNodeFilter,
  immutableSetNodeProperty
} from '../utils/TreeUtils';
import { renameKey } from '../utils/SlugUtils';
import { applyPatch, createPatch } from '../utils/PatchUtils';
import storyStub from '../stubs/storyNodeStub';
import type { Action, MapNode, MapTreesState } from '../types';
import exampleMapTreesStub from '../stubs/exampleMapTreesStub';

const reducer = (state: any, action: Action) => {
  const selectedTreeKey = state.selectedTreeKey + '';
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
          ...(state.undo || {}),
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
      if (
        action.payload.patchKey &&
        state.undo &&
        state.undo[action.payload.patchKey]
      ) {
        const patch = state.undo[action.payload.patchKey];
        const newState = applyPatch(state, patch);
        delete newState.undo[action.payload.patchKey];
        newState.redo[action.payload.patchKey] = createPatch(newState, state);
        return newState;
      } else {
        return state;
      }
    case 'REDO':
      if (
        action.payload.patchKey &&
        state.redo &&
        state.redo[action.payload.patchKey]
      ) {
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
      return {
        ...state,
        touched: undefined,
        trees: undefined,
        undo: {},
        redo: {},
        renameKeys: {}
      } as MapTreesState;
    case 'CHANGE_SELECTED_TREE':
      return {
        ...state,
        selectedTreeKey: action.payload + ''
      };
    case 'SET_VALUE':
      const { cloneTree } = immutableSetNodeProperty(
        state.trees[selectedTreeKey].tree,
        action.payload.node,
        action.payload.key,
        JSON.parse(JSON.stringify(action.payload.value))
      );
      return {
        ...state,
        trees: {
          ...state.trees,
          [selectedTreeKey]: {
            ...state.trees[selectedTreeKey],
            tree: cloneTree
          }
        }
      };
    case 'SET_NODES':
      return {
        ...state,
        trees: {
          ...state.trees,
          [selectedTreeKey]: {
            ...state.trees[selectedTreeKey],
            tree: [...action.payload]
          }
        }
      };
    case 'LOAD_TREES':
      return {
        ...state,
        trees: { ...action.payload }
      };
    case 'CREATE_TREE':
      return {
        ...state,
        trees: {
          ...state.trees,
          [action.payload.key + '']: {
            ...action.payload.state
          }
        },
        selectedTreeKey: action.payload.key + ''
      };
    case 'NODE_CLICKED':
      return {
        ...state,
        trees: {
          ...state.trees,
          [selectedTreeKey]: {
            ...state.trees[selectedTreeKey],
            selectedTreeIndex: action.payload.treeIndex,
            selectedNodeKey: action.payload.node.key + ''
          }
        }
      };
    case 'TOUCHED':
      return { ...state, touched: action.payload };
    case 'ADD_TREE_NODE':
      const node: MapNode = {
        ...JSON.parse(JSON.stringify(storyStub)),
        ...JSON.parse(JSON.stringify(action.payload.node))
      };
      const tree: MapNode[] = immutableInsertNodeAfter(
        action.payload.selectedNode,
        state.trees[selectedTreeKey].tree,
        node
      );
      const selectedTreeIndex: number = getTreeIndexByNode(node, tree);
      return {
        ...state,
        trees: {
          ...state.trees,
          [selectedTreeKey]: {
            ...state.trees[selectedTreeKey],
            selectedTreeIndex,
            selectedNodeKey: node.key,
            tree
          }
        }
      };
    case 'REMOVE_TREE_NODE':
      const clone = immutableNodeFilter(
        action.payload,
        state.trees[selectedTreeKey].tree
      );
      return {
        ...state,
        trees: {
          ...state.trees,
          [selectedTreeKey]: {
            ...state.trees[selectedTreeKey],
            selectedTreeIndex: 0,
            selectedNodeKey: clone[0]?.key,
            tree: clone
          }
        }
      };
    case 'RENAME_TREE_KEY':
      const trees = renameKey(
        state.trees,
        action.payload.old + '',
        action.payload.new + ''
      );
      return {
        ...state,
        trees: { ...trees }
      };
    default:
      return state;
  }
};

export default reducer;
