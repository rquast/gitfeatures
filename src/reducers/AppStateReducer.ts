import { applyAppStatePatch } from '../utils/PatchUtils';
import type { Action, AppState } from '../types';

const reducer = (state: any, action: Action) => {
  switch (action.type) {
    case 'PATCH':
      return applyAppStatePatch(state, action.payload);
    case 'CLEAR_UNDO':
    case 'RELOAD':
      return {
        ...state,
        undoStack: [],
        redoStack: [],
        treeView: {
          isExpanded: false,
          isSpecTreeVisible: true,
          isMapTreeVisible: true
        }
      } as AppState;
    case 'ADD_UNDO':
      const undoStack = state.undoStack || [];
      return {
        ...state,
        undoStack: undoStack.concat([
          {
            patchKey: action.payload.patchKey,
            descriptions: action.payload.descriptions || []
          }
        ]),
        redoStack: []
      };
    case 'UNDO':
      if (state.undoStack && state.undoStack.length > 0) {
        const undoStackClone = [...state.undoStack];
        const redoStackClone = [...(state.redoStack || [])];
        redoStackClone.push(undoStackClone.pop());
        return {
          ...state,
          undoStack: undoStackClone,
          redoStack: redoStackClone
        };
      } else {
        return state;
      }
    case 'REDO':
      if (state.redoStack && state.redoStack.length > 0) {
        const undoStackClone = [...(state.undoStack || [])];
        const redoStackClone = [...state.redoStack];
        undoStackClone.push(redoStackClone.pop());
        return {
          ...state,
          undoStack: undoStackClone,
          redoStack: redoStackClone
        };
      } else {
        return state;
      }
    case 'TOUCHED':
      return { ...state, touched: action.payload };
    case 'SET_CURRENT_REPOSITORY_URL':
      return {
        ...state,
        config: { ...state.config, currentRepositoryURL: action.payload + '' }
      };
    case 'ADD_REPOSITORY_URL':
      return {
        ...state,
        config: {
          ...state.config,
          repositories: state.config.repositories.concat(action.payload)
        }
      };
    case 'LOAD_CONFIG':
      return { ...state, config: { ...action.payload } };
    case 'INSERT_VALUE_EVENT':
      return { ...state, insertValueEvent: { ...action.payload } };
    case 'CHANGE_FILES_MODAL':
      return {
        ...state,
        filesModal: { ...state.filesModal, ...action.payload }
      };
    case 'CHANGE_ADD_TAG_MODAL':
      return {
        ...state,
        addTagModal: { ...state.addTagModal, ...action.payload }
      };
    case 'CHANGE_DELETE_NODE_MODAL':
      return {
        ...state,
        deleteNodeModal: { ...state.deleteNodeModal, ...action.payload }
      };
    case 'CHANGE_TREE_NODE_MODAL':
      return {
        ...state,
        treeNodeModal: { ...state.treeNodeModal, ...action.payload }
      };
    case 'CHANGE_EMOTICON_PICKER_MODAL':
      return {
        ...state,
        emoticonPickerModal: { ...state.emoticonPickerModal, ...action.payload }
      };
    case 'CHANGE_MERMAID_MODAL':
      return {
        ...state,
        mermaidModal: { ...state.mermaidModal, ...action.payload }
      };
    case 'CHANGE_TREE_VIEW':
      return { ...state, treeView: { ...state.treeView, ...action.payload } };
    case 'CHANGE_HELP_DRAWER':
      return {
        ...state,
        helpDrawer: { ...state.helpDrawer, ...action.payload }
      };
    case 'CHANGE_GIT_ACTIONS_MODAL':
      return {
        ...state,
        gitActionsModal: { ...state.gitActionsModal, ...action.payload }
      };
    case 'CHANGE_SETTINGS_MODAL':
      return {
        ...state,
        settingsModal: { ...state.settingsModal, ...action.payload }
      };
    case 'SET_COMMIT_PUSH_CHECKED':
      return {
        ...state,
        config: { ...state.config, isCommitPushChecked: action.payload }
      };
    case 'SET_GIT_PROFILE':
      return {
        ...state,
        config: {
          ...state.config,
          gitProfiles: {
            ...state.config.gitProfiles,
            [action.payload['profile-name']]: action.payload
          }
        }
      };
    case 'DELETE_GIT_PROFILE':
      const cloneOfDeleteGitProfiles: any = JSON.parse(
        JSON.stringify(state.config.gitProfiles)
      );
      delete cloneOfDeleteGitProfiles[action.payload];
      return {
        ...state,
        config: {
          ...state.config,
          gitProfiles: { ...cloneOfDeleteGitProfiles }
        }
      };
    case 'SET_LOCAL_REPOSITORY':
      const cloneOfSetLocalRepositories: any = JSON.parse(
        JSON.stringify(state.config.localRepositories)
      );
      cloneOfSetLocalRepositories[action.payload.key] = action.payload.value;
      return {
        ...state,
        config: {
          ...state.config,
          localRepositories: { ...cloneOfSetLocalRepositories }
        }
      };
    case 'DELETE_LOCAL_REPOSITORY':
      const cloneOfDeleteLocalRepositories: any = JSON.parse(
        JSON.stringify(state.config.localRepositories)
      );
      delete cloneOfDeleteLocalRepositories[action.payload];
      return {
        ...state,
        config: {
          ...state.config,
          localRepositories: { ...cloneOfDeleteLocalRepositories }
        }
      };
    default:
      return state;
  }
};

export default reducer;
