import React, { useEffect } from 'react';
import reducer from '../reducers/SpecificationReducer';
import { persistState } from '../persistence/GitStorage';
import useAppState from '../hooks/useAppState';
import useThunkReducer, { Thunk } from 'react-hook-thunk-reducer';
import type { Action, SpecTreeState } from '../types';

const STORAGE_KEY = 'spec-tree';

const initialState: SpecTreeState = {
  tree: undefined,
  undo: {},
  redo: {},
  renameKeys: {},
  touched: undefined,
  selectedTreeIndex: 0,
  selectedNodeKey: undefined
};

const store = React.createContext<{
  state: SpecTreeState;
  dispatch: React.Dispatch<Action | Thunk<SpecTreeState, Action>>;
}>({
  dispatch(value: Action | Thunk<SpecTreeState, Action>): void {},
  state: initialState
});
const { Provider } = store;

const SpecificationProvider = ({ children, persistence }: any) => {
  const [state, dispatch] = useThunkReducer(reducer, initialState);
  const { currentRepositoryURL } = useAppState();
  useEffect(() => {
    if (persistence) {
      persistence(STORAGE_KEY, state, currentRepositoryURL);
    } else {
      persistState(STORAGE_KEY, state, currentRepositoryURL);
    }
  }, [state, state.undo, state.redo]);
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, SpecificationProvider };
