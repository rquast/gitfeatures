import { useContext, useCallback } from 'react';
import { store as appStateStore } from '../context/AppStateContext';
import { store as specificationStore } from '../context/SpecificationContext';
import { store as exampleMapStore } from '../context/ExampleMapContext';
import specificationTreeStub from '../stubs/specificationTreeStub';
import {
  fetchLocalMapState,
  fetchLocalSpecState
} from '../persistence/GitStorage';
import exampleMapTreeStub from '../stubs/exampleMapTreesStub';
import useAppState from './useAppState';
import touchedAction from '../actions/touchedAction';
import setNodesAction from '../actions/setNodesAction';

const useLoadFromBrowser = () => {
  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const { currentRepositoryURL } = useAppState();

  return useCallback(() => {
    if (currentRepositoryURL) {
      let isLoadedFromLocalState = true;
      let stateWasLoaded = false;

      if (!exampleMapContext.state.trees) {
        let localState = fetchLocalMapState(currentRepositoryURL);
        if (!localState) {
          isLoadedFromLocalState = false;
          localState = JSON.parse(JSON.stringify(exampleMapTreeStub));
        }
        exampleMapContext.dispatch({
          type: 'LOAD_TREES',
          payload: localState.trees
        });
        exampleMapContext.dispatch({
          type: 'SET_RENAME_KEYS',
          payload: localState.renameKeys || {}
        });
        exampleMapContext.dispatch({ type: 'CLEAR_UNDO' });
        exampleMapContext.dispatch({
          type: 'TOUCHED',
          payload: localState.touched
        });
        stateWasLoaded = true;
      }

      if (!Array.isArray(specificationContext.state.tree)) {
        let localState = fetchLocalSpecState(currentRepositoryURL);
        if (!localState) {
          isLoadedFromLocalState = false;
          localState = JSON.parse(JSON.stringify(specificationTreeStub));
        }
        specificationContext.dispatch({
          type: 'SET_NODES',
          payload: localState.tree
        });
        specificationContext.dispatch({
          type: 'SET_RENAME_KEYS',
          payload: localState.renameKeys || {}
        });
        specificationContext.dispatch({ type: 'CLEAR_UNDO' });
        specificationContext.dispatch({
          type: 'TOUCHED',
          payload: localState.touched
        });
        stateWasLoaded = true;
      } else if (
        Array.isArray(specificationContext.state.tree) &&
        specificationContext.state.tree.length === 0
      ) {
        const localState = JSON.parse(JSON.stringify(specificationTreeStub));
        specificationContext.dispatch(setNodesAction(localState.tree));
        specificationContext.dispatch(touchedAction());
        stateWasLoaded = true;
      }

      if (stateWasLoaded) {
        appStateContext.dispatch({ type: 'CLEAR_UNDO' });
      }

      if (!isLoadedFromLocalState) {
        setTimeout(() => {
          appStateContext.dispatch({
            type: 'CHANGE_GIT_ACTIONS_MODAL',
            payload: { isOpen: true, view: 'clone-repository' }
          });
        }, 1000);
      }
    }
  }, [
    currentRepositoryURL,
    exampleMapContext.state,
    specificationContext.state
  ]);
};

export default useLoadFromBrowser;
