import { useContext, useMemo } from 'react';
import { store as appStateStore } from '../context/AppStateContext';
import { store as specificationStore } from '../context/SpecificationContext';
import { store as exampleMapStore } from '../context/ExampleMapContext';
import touchedAction from '../actions/touchedAction';
import type { GitConfig } from '../types';

function useAppState(): {
  config: GitConfig | undefined;
  loadErrors: string[];
  currentRepositoryURL: string | undefined;
  insertValueEvent: {
    eventKey: string | undefined;
    value: string;
  };
  isLocalConfigStateDifferent: boolean;
  isLocalTreeStateDifferent: boolean;
  isFilesModalOpen: boolean;
  isAddTagModalOpen: boolean;
  isGitActionsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isEmoticonPickerModalOpen: boolean;
  isHelpDrawerOpen: boolean;
  isMermaidModalOpen: boolean;
  isCommitPushChecked: boolean;
  onToggleCommitPushChecked: () => void;
  onOpenFilesModal: (eventKey?: string) => void;
  onCloseFilesModal: () => void;
  onOpenAddTagModal: () => void;
  onCloseAddTagModal: () => void;
  onOpenHelpDrawer: (view: string) => void;
  onOpenEmoticonPickerModal: (eventKey?: string) => void;
  onOpenMermaidModal: (eventKey?: string) => void;
  onCloseGitActionsModal: () => void;
  onOpenSettingsModal: () => void;
  onCloseSettingsModal: () => void;
  onCloseEmoticonPickerModal: () => void;
  onCloseHelpDrawer: () => void;
  onCloseMermaidModal: () => void;
  onInsertValueEvent: (value?: string, eventKey?: string) => void;
  onCancelEmoticonPickerModal: () => void;
} {
  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const config: GitConfig | undefined = appStateContext.state?.config;

  const insertValueEvent = appStateContext.state?.insertValueEvent;

  const isFilesModalOpen: boolean = appStateContext.state?.filesModal?.isOpen;

  const isGitActionsModalOpen: boolean =
    appStateContext.state?.gitActionsModal?.isOpen;

  const isSettingsModalOpen: boolean =
    appStateContext.state?.settingsModal?.isOpen;

  const isCommitPushChecked: boolean = !!appStateContext.state?.config
    ?.isCommitPushChecked;

  const isAddTagModalOpen: boolean = appStateContext.state?.addTagModal?.isOpen;

  const isEmoticonPickerModalOpen: boolean =
    appStateContext.state?.emoticonPickerModal?.isOpen;

  const isHelpDrawerOpen: boolean = appStateContext.state?.helpDrawer?.isOpen;

  const isMermaidModalOpen: boolean =
    appStateContext.state?.mermaidModal?.isOpen;

  const loadErrors: string[] = useMemo(() => {
    let errors: string[] = [];
    if (!appStateContext.state.config) {
      errors.push('config not loaded');
    }
    if (!specificationContext.state.tree) {
      errors.push('specification tree not loaded');
    }
    if (!exampleMapContext.state.trees) {
      errors.push('example map trees not loaded');
    }
    return errors;
  }, [appStateContext, specificationContext, exampleMapContext]);

  const isLocalConfigStateDifferent = useMemo(() => {
    return !!appStateContext.state?.touched;
  }, [appStateContext.state]);

  const isLocalTreeStateDifferent: boolean = useMemo(() => {
    return (
      !!specificationContext.state?.touched ||
      !!exampleMapContext.state?.touched
    );
  }, [specificationContext.state, exampleMapContext.state]);

  const currentRepositoryURL: string | undefined = useMemo(() => {
    if (appStateContext.state?.config) {
      return appStateContext.state.config.currentRepositoryURL;
    }
  }, [appStateContext.state.config]);

  const onOpenFilesModal = (eventKey?: string) => {
    appStateContext.dispatch({
      type: 'CHANGE_FILES_MODAL',
      payload: { isOpen: true, view: 'files', eventKey: eventKey + '' }
    });
  };

  const onCloseFilesModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_FILES_MODAL',
      payload: { isOpen: false }
    });
  };

  const onOpenAddTagModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_ADD_TAG_MODAL',
      payload: { isOpen: true }
    });
  };

  const onCloseAddTagModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_ADD_TAG_MODAL',
      payload: { isOpen: false }
    });
  };

  const onToggleCommitPushChecked = () => {
    appStateContext.dispatch({
      type: 'SET_COMMIT_PUSH_CHECKED',
      payload: !appStateContext.state.config?.isCommitPushChecked
    });
    appStateContext.dispatch(touchedAction());
  };

  const onOpenEmoticonPickerModal = (eventKey?: string) => {
    appStateContext.dispatch({
      type: 'CHANGE_EMOTICON_PICKER_MODAL',
      payload: { isOpen: true, eventKey: eventKey + '' }
    });
  };

  const onOpenHelpDrawer = (view: string) => {
    appStateContext.dispatch({
      type: 'CHANGE_HELP_DRAWER',
      payload: { isOpen: true, view: view + '' }
    });
  };

  const onOpenMermaidModal = (eventKey?: string) => {
    appStateContext.dispatch({
      type: 'CHANGE_MERMAID_MODAL',
      payload: { isOpen: true, eventKey: eventKey + '' }
    });
  };

  const onCloseGitActionsModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_GIT_ACTIONS_MODAL',
      payload: { isOpen: false }
    });
  };

  const onOpenSettingsModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_SETTINGS_MODAL',
      payload: { isOpen: true, view: 'gitProfiles' }
    });
  };

  const onCloseSettingsModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_SETTINGS_MODAL',
      payload: { isOpen: false }
    });
  };

  const onCloseEmoticonPickerModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_EMOTICON_PICKER_MODAL',
      payload: { isOpen: false }
    });
  };

  const onCloseHelpDrawer = () => {
    appStateContext.dispatch({
      type: 'CHANGE_HELP_DRAWER',
      payload: { isOpen: false }
    });
  };

  const onCloseMermaidModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_MERMAID_MODAL',
      payload: { isOpen: false }
    });
  };

  const onInsertValueEvent = (value?: string, eventKey?: string) => {
    appStateContext.dispatch({
      type: 'INSERT_VALUE_EVENT',
      payload: { eventKey: eventKey + '', value: value + '' }
    });
  };

  const onCancelEmoticonPickerModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_EMOTICON_PICKER_MODAL',
      payload: { isOpen: false }
    });
  };

  return {
    config,
    loadErrors,
    currentRepositoryURL,
    insertValueEvent,
    isLocalConfigStateDifferent,
    isLocalTreeStateDifferent,
    isFilesModalOpen,
    isAddTagModalOpen,
    isGitActionsModalOpen,
    isSettingsModalOpen,
    isEmoticonPickerModalOpen,
    isHelpDrawerOpen,
    isMermaidModalOpen,
    isCommitPushChecked,
    onToggleCommitPushChecked,
    onOpenFilesModal,
    onCloseFilesModal,
    onOpenAddTagModal,
    onCloseAddTagModal,
    onOpenEmoticonPickerModal,
    onOpenHelpDrawer,
    onOpenMermaidModal,
    onCloseGitActionsModal,
    onOpenSettingsModal,
    onCloseSettingsModal,
    onCloseEmoticonPickerModal,
    onCloseHelpDrawer,
    onCloseMermaidModal,
    onInsertValueEvent,
    onCancelEmoticonPickerModal
  };
}

export default useAppState;
