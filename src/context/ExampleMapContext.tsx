import React, { useEffect } from 'react';
import reducer from '../reducers/ExampleMapReducer';
import { persistState } from '../persistence/GitStorage';
import useAppState from '../hooks/useAppState';
import useThunkReducer, { Thunk } from 'react-hook-thunk-reducer';
import type { Action, MapTreesState } from '../types';

const STORAGE_KEY = 'map-tree';

const initialState: MapTreesState = {
  trees: undefined,
  undo: {},
  redo: {},
  renameKeys: {},
  touched: undefined
};

const store = React.createContext<{
  state: MapTreesState;
  dispatch: React.Dispatch<Action | Thunk<MapTreesState, Action>>;
}>({
  dispatch(value: Action | Thunk<MapTreesState, Action>): void {},
  state: initialState
});
const { Provider } = store;

const ExampleMapProvider = ({ children, persistence }: any) => {
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

export { store, ExampleMapProvider };
