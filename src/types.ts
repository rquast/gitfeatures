import type { Operation } from 'fast-json-patch';

export interface FeatureToggles {
  [key: string]: {
    title: string;
    state: string;
    conditions: string;
  };
}

export interface Auth {
  username: string;
  password?: string;
}

export interface GitProfile {
  'profile-name': string;
  'cors-proxy-address': string;
  'author-name': string;
  'author-email': string;
  'default-branch': string;
  'remote-name': string;
  'pgp-private-key': string;
  username: string;
  password: string;
}

export interface GitConfig {
  currentRepositoryURL: string;
  localRepositories: {
    [key: string]: {
      'git-profile-name': string;
      'current-branch': string;
    };
  };
  isCommitPushChecked: boolean;
  gitProfiles: {
    [key: string]: GitProfile;
  };
}

export interface RenameKeys {
  [key: string]: string;
}

export interface TagValue {
  type: string;
  name: string;
}

export interface SpecNode {
  type: string;
  key: string;
  title: string;
  expanded: boolean;
  tags?: TagValue[];
  gherkin?: string;
  notes?: string;
  toggleState?: string;
  conditions?: string;
  children?: SpecNode[];
}

export interface MapNode {
  type: string;
  key: string;
  title: string;
  expanded: boolean;
  notes?: string;
  children?: MapNode[];
}

export interface Undo {
  [key: string]: Operation[];
}

export interface Redo {
  [key: string]: Operation[];
}

export interface UndoRedoStackItem {
  patchKey: string;
  descriptions?: string[];
}

export interface SpecTreeState {
  undo: Undo;
  redo: Redo;
  renameKeys: RenameKeys;
  touched: number | undefined;
  selectedTreeIndex: number;
  selectedNodeKey: string | undefined;
  tree: SpecNode[] | undefined;
}

export interface MapTreesState {
  undo: Undo;
  redo: Redo;
  renameKeys: RenameKeys;
  touched: number | undefined;
  trees:
    | {
        [key: string]: MapTreeState;
      }
    | undefined;
}

export interface MapTreeState {
  selectedTreeIndex: number;
  selectedNodeKey: string | undefined;
  tree: MapNode[];
}

export interface AppState {
  touched: number | undefined;
  config: GitConfig | undefined;
  undoStack: UndoRedoStackItem[];
  redoStack: UndoRedoStackItem[];
  settingsModal: {
    isOpen: boolean;
    view: string;
  };
  insertValueEvent: {
    eventKey: string | undefined;
    value: string;
  };
  mermaidModal: {
    isOpen: boolean;
    value: string | undefined;
    eventKey: string | undefined;
  };
  emoticonPickerModal: {
    isOpen: boolean;
    value: string | undefined;
    eventKey: string | undefined;
  };
  filesModal: {
    isOpen: boolean;
    view: string;
    eventKey: string | undefined;
  };
  gitActionsModal: {
    isOpen: boolean;
    view: string;
  };
  addTagModal: {
    isOpen: boolean;
  };
  helpDrawer: {
    isOpen: boolean;
    view: string;
  };
  deleteNodeModal: {
    isOpen: boolean;
    view: string;
  };
  treeNodeModal: {
    isOpen: boolean;
    view: string;
    mode: string;
  };
  treeView: {
    isExpanded: boolean;
    isSpecTreeVisible: boolean;
    isMapTreeVisible: boolean;
  };
}

export interface SketchElementProps {
  markdown: string;
  drawing: string;
  language: string;
  sourcePosition: any;
  onChange: any;
  width?: number;
  height?: number;
  isEditing: boolean;
}

export interface Action {
  type: string;
  payload?: any;
  description?: string;
}

export interface PatchFilter {
  includePaths?: string[];
  excludePaths?: string[];
}

export interface ContextActions {
  type: string;
  action: Action;
  filter?: PatchFilter;
}

export interface CloneRepositoryParms {
  (url: string, gitProfile: GitProfile): Promise<string | void>;
}

export interface InitRepositoryParms {
  (url: string, branch: string, remote: string): Promise<void>;
}
