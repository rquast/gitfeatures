import React, { useEffect } from 'react';
import reducer from '../reducers/AppStateReducer';
import { persistState } from '../persistence/GitStorage';
import useThunkReducer, { Thunk } from 'react-hook-thunk-reducer';
import type { Action, AppState } from '../types';
import { initialAppState } from './initialAppState';

const STORAGE_KEY = 'config';

const initialState = JSON.parse(JSON.stringify(initialAppState));

const store = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action | Thunk<AppState, Action>>;
}>({
  dispatch(value: Action | Thunk<AppState, Action>): void {},
  state: initialState
});
const { Provider } = store;

const AppStateProvider = ({ children, persistence }: any) => {
  const [state, dispatch] = useThunkReducer(reducer, initialState);
  useEffect(() => {
    if (persistence) {
      persistence(STORAGE_KEY, state);
    } else {
      persistState(STORAGE_KEY, state);
    }
  }, [state]);
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, AppStateProvider };
