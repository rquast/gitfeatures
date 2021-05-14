import type { AppState } from '../types';

const initialAppState: AppState = {
  config: undefined,
  undoStack: [],
  redoStack: [],
  settingsModal: {
    isOpen: false,
    view: ''
  },
  insertValueEvent: {
    eventKey: undefined,
    value: ''
  },
  mermaidModal: {
    isOpen: false,
    value: undefined,
    eventKey: undefined
  },
  emoticonPickerModal: {
    isOpen: false,
    value: undefined,
    eventKey: undefined
  },
  filesModal: {
    isOpen: false,
    view: '',
    eventKey: undefined
  },
  gitActionsModal: {
    isOpen: false,
    view: ''
  },
  addTagModal: {
    isOpen: false
  },
  helpDrawer: {
    isOpen: false,
    view: ''
  },
  deleteNodeModal: {
    isOpen: false,
    view: 'spec'
  },
  treeNodeModal: {
    isOpen: false,
    view: 'folder',
    mode: 'create'
  },
  treeView: {
    isExpanded: false,
    isSpecTreeVisible: true,
    isMapTreeVisible: true
  },
  touched: undefined
};

export { initialAppState };
