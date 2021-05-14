import { useContext, useMemo } from 'react';
import { store as appStateStore } from '../context/AppStateContext';
import { store as specificationStore } from '../context/SpecificationContext';
import { store as exampleMapStore } from '../context/ExampleMapContext';
import { getNodeByNodeKey } from '../utils/TreeUtils';
import type { MapNode, MapTreeState, SpecNode, SpecTreeState } from '../types';
import useAppState from './useAppState';
import { getSessionValue, setSessionValue } from '../utils/SessionUtils';

function useTree(): {
  currentSpecNode: SpecNode | undefined;
  currentSpecState: SpecTreeState;
  currentMapNode: MapNode | undefined;
  currentMapState: MapTreeState | undefined;
  onOpenDeleteSpecNodeModal: any;
  onOpenDeleteMapNodeModal: any;
  onToggleExpandTreeView: () => void;
  onToggleSpecTreeVisibility: () => void;
  onToggleMapTreeVisibility: () => void;
  isTreeViewExpanded: boolean;
  isSpecTreeVisible: boolean;
  isMapTreeVisible: boolean;
  isDeleteSpecNodeModalOpen: boolean;
  isDeleteMapNodeModalOpen: boolean;
  isTreeNodeModalOpen: boolean;
  isSpecificationReady: boolean;
  treeNodeModalView: string;
  treeNodeModalMode: string;
  onCloseDeleteNodeModal: () => void;
  onCloseTreeNodeModal: () => void;
  createFolder: () => void;
  createFeature: () => void;
  createExampleMap: () => void;
  createStory: () => void;
  createRule: () => void;
  createExample: () => void;
  createQuestion: () => void;
} {
  const { currentRepositoryURL } = useAppState();

  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const currentSpecNode: SpecNode | undefined = useMemo(() => {
    if (
      specificationContext.state.tree &&
      specificationContext.state.selectedNodeKey
    ) {
      return getNodeByNodeKey(
        specificationContext.state.selectedNodeKey,
        specificationContext.state.tree
      );
    }
  }, [
    specificationContext.state.selectedNodeKey,
    specificationContext.state.touched
  ]);

  const currentSpecState: SpecTreeState = specificationContext.state;

  const currentMapState: MapTreeState | undefined = useMemo(() => {
    if (
      exampleMapContext.state?.trees &&
      specificationContext.state.selectedNodeKey
    ) {
      return exampleMapContext.state.trees[
        specificationContext.state.selectedNodeKey
      ];
    }
  }, [
    specificationContext.state.selectedNodeKey,
    exampleMapContext.state.trees
  ]);

  const currentMapNode: MapNode | undefined = useMemo(() => {
    if (currentMapState && currentMapState.selectedNodeKey) {
      return getNodeByNodeKey(
        currentMapState.selectedNodeKey,
        currentMapState.tree
      );
    }
  }, [currentMapState, exampleMapContext.state.touched]);

  const isDeleteSpecNodeModalOpen: boolean = useMemo(() => {
    return (
      appStateContext.state.deleteNodeModal.isOpen &&
      appStateContext.state.deleteNodeModal.view === 'spec'
    );
  }, [appStateContext.state.deleteNodeModal]);

  const isDeleteMapNodeModalOpen: boolean = useMemo(() => {
    return (
      appStateContext.state.deleteNodeModal.isOpen &&
      appStateContext.state.deleteNodeModal.view === 'map'
    );
  }, [appStateContext.state.deleteNodeModal]);

  const isTreeNodeModalOpen: boolean =
    appStateContext.state.treeNodeModal.isOpen;

  const isSpecificationReady: boolean = useMemo(() => {
    return (
      Array.isArray(specificationContext.state.tree) &&
      typeof exampleMapContext.state.trees !== 'undefined'
    );
  }, [specificationContext.state, exampleMapContext.state]);

  const treeNodeModalView: string = appStateContext.state.treeNodeModal.view;

  const treeNodeModalMode: string = appStateContext.state.treeNodeModal.mode;

  const isTreeViewExpanded = useMemo(() => {
    if (currentRepositoryURL) {
      const sessionValue = getSessionValue(
        currentRepositoryURL,
        'isTreeViewExpanded'
      );
      if (sessionValue !== null) {
        return sessionValue === 'true';
      }
    }
    return false;
  }, [appStateContext.state.treeView, currentRepositoryURL]);

  const isSpecTreeVisible = useMemo(() => {
    if (currentRepositoryURL) {
      const sessionValue = getSessionValue(
        currentRepositoryURL,
        'isSpecTreeVisible'
      );
      if (sessionValue !== null) {
        return sessionValue === 'true';
      }
    }
    return true;
  }, [appStateContext.state.treeView, currentRepositoryURL]);

  const isMapTreeVisible = useMemo(() => {
    if (currentRepositoryURL) {
      const sessionValue = getSessionValue(
        currentRepositoryURL,
        'isMapTreeVisible'
      );
      if (sessionValue !== null) {
        return sessionValue === 'true';
      }
    }
    return true;
  }, [appStateContext.state.treeView, currentRepositoryURL]);

  const onToggleExpandTreeView = () => {
    const newState = !isTreeViewExpanded;
    if (currentRepositoryURL) {
      appStateContext.dispatch({
        type: 'CHANGE_TREE_VIEW',
        payload: { isExpanded: newState }
      });
      setSessionValue(
        currentRepositoryURL,
        'isTreeViewExpanded',
        newState + ''
      );
    }
  };

  const onToggleSpecTreeVisibility = () => {
    const newState = !isSpecTreeVisible;
    if (currentRepositoryURL) {
      appStateContext.dispatch({
        type: 'CHANGE_TREE_VIEW',
        payload: { isSpecTreeVisible: newState }
      });
      setSessionValue(currentRepositoryURL, 'isSpecTreeVisible', newState + '');
    }
  };

  const onToggleMapTreeVisibility = () => {
    const newState = !isMapTreeVisible;
    if (currentRepositoryURL) {
      appStateContext.dispatch({
        type: 'CHANGE_TREE_VIEW',
        payload: { isMapTreeVisible: newState }
      });
      setSessionValue(currentRepositoryURL, 'isMapTreeVisible', newState + '');
    }
  };

  const onOpenDeleteSpecNodeModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_DELETE_NODE_MODAL',
      payload: { isOpen: true, view: 'spec' }
    });
  };

  const onOpenDeleteMapNodeModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_DELETE_NODE_MODAL',
      payload: { isOpen: true, view: 'map' }
    });
  };

  const onCloseDeleteNodeModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_DELETE_NODE_MODAL',
      payload: { isOpen: false }
    });
  };

  const onCloseTreeNodeModal = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: false }
    });
  };

  const createFolder = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'folder', mode: 'create' }
    });
  };

  const createFeature = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'feature', mode: 'create' }
    });
  };

  const createExampleMap = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'map', mode: 'create' }
    });
  };

  const createStory = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'story', mode: 'create' }
    });
  };

  const createRule = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'rule', mode: 'create' }
    });
  };

  const createExample = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'example', mode: 'create' }
    });
  };

  const createQuestion = () => {
    appStateContext.dispatch({
      type: 'CHANGE_TREE_NODE_MODAL',
      payload: { isOpen: true, view: 'question', mode: 'create' }
    });
  };

  return {
    currentSpecNode,
    currentSpecState,
    currentMapNode,
    currentMapState,
    onOpenDeleteSpecNodeModal,
    onOpenDeleteMapNodeModal,
    onToggleExpandTreeView,
    onToggleSpecTreeVisibility,
    onToggleMapTreeVisibility,
    isTreeViewExpanded,
    isSpecTreeVisible,
    isMapTreeVisible,
    isDeleteSpecNodeModalOpen,
    isDeleteMapNodeModalOpen,
    isTreeNodeModalOpen,
    isSpecificationReady,
    onCloseDeleteNodeModal,
    onCloseTreeNodeModal,
    treeNodeModalView,
    treeNodeModalMode,
    createFolder,
    createFeature,
    createExampleMap,
    createStory,
    createRule,
    createExample,
    createQuestion
  };
}

export default useTree;
