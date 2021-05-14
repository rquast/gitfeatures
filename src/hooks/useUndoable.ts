import React, { useContext, useMemo } from 'react';
import { store as appStateStore } from '../context/AppStateContext';
import { store as specificationStore } from '../context/SpecificationContext';
import { store as exampleMapStore } from '../context/ExampleMapContext';
import { createPatch } from '../utils/PatchUtils';
import { nanoid } from 'nanoid';
import type {
  AppState,
  Action,
  ContextActions,
  UndoRedoStackItem
} from '../types';
import type { Thunk } from 'react-hook-thunk-reducer';

const useUndoable = (): {
  undoable: Function;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  onUndo: Function;
  onRedo: Function;
  clearUndo: Function;
} => {
  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const undoable = (contextActions: ContextActions[]): void => {
    const patchKey: string = nanoid();

    let descriptions: string[] = [];
    let affectedContexts: any = [];

    // collate dispatch, state and actions
    for (const contextAction of contextActions) {
      if (contextAction.type === 'spec') {
        affectedContexts.push({
          dispatch: specificationContext.dispatch,
          state: specificationContext.state,
          ...contextAction
        });
      } else if (contextAction.type === 'map') {
        affectedContexts.push({
          dispatch: exampleMapContext.dispatch,
          state: exampleMapContext.state,
          ...contextAction
        });
      }
    }

    // get snapshot of affected contexts
    for (const affectedContext of affectedContexts) {
      // prepare old snapshot
      affectedContext['snapshot'] = JSON.parse(
        JSON.stringify(affectedContext.state)
      );
    }

    // run actions
    for (const affectedContext of affectedContexts) {
      affectedContext.dispatch(async (dispatch: any) => {
        dispatch(affectedContext.action);
        if (affectedContext.action.description) {
          descriptions.push(affectedContext.action.description);
        }
      });
    }

    // diff and fire undo for affected contexts
    for (const affectedContext of affectedContexts) {
      affectedContext.dispatch(async (dispatch: any, getState: any) => {
        // process patch
        dispatch({
          type: 'ADD_UNDO',
          payload: {
            patchKey,
            patch: createPatch(
              getState(),
              affectedContext.snapshot,
              affectedContext.filter
            ),
            descriptions
          }
        });
      });
    }

    // add patch to appStateContext undo stack
    appStateContext.dispatch({
      type: 'ADD_UNDO',
      payload: { patchKey, descriptions }
    });
  };

  const isUndoAvailable: boolean = useMemo(() => {
    return (
      appStateContext.state.undoStack &&
      appStateContext.state.undoStack.length > 0
    );
  }, [appStateContext.state.undoStack]);

  const isRedoAvailable: boolean = useMemo(() => {
    return (
      appStateContext.state.redoStack &&
      appStateContext.state.redoStack.length > 0
    );
  }, [appStateContext.state.redoStack]);

  const onRedo = (): void => {
    appStateContext.dispatch(
      (
        dispatch: React.Dispatch<Action | Thunk<AppState, Action>>,
        getState: Function
      ) => {
        const redoStack: UndoRedoStackItem[] = getState().redoStack;
        const { patchKey } = redoStack[redoStack.length - 1];
        if (patchKey) {
          specificationContext.dispatch({
            type: 'REDO',
            payload: { patchKey }
          });
          exampleMapContext.dispatch({
            type: 'REDO',
            payload: { patchKey }
          });
          dispatch({ type: 'REDO' });
        }
      }
    );
  };

  const onUndo = (): void => {
    appStateContext.dispatch(
      (
        dispatch: React.Dispatch<Action | Thunk<AppState, Action>>,
        getState: Function
      ) => {
        const undoStack: UndoRedoStackItem[] = getState().undoStack;
        const { patchKey } = undoStack[undoStack.length - 1];
        exampleMapContext.dispatch({
          type: 'UNDO',
          payload: { patchKey }
        });
        specificationContext.dispatch({
          type: 'UNDO',
          payload: { patchKey }
        });
        dispatch({ type: 'UNDO' });
      }
    );
  };

  const clearUndo = (): void => {
    exampleMapContext.dispatch({ type: 'CLEAR_UNDO' });
    specificationContext.dispatch({ type: 'CLEAR_UNDO' });
    appStateContext.dispatch({ type: 'CLEAR_UNDO' });
  };

  return {
    undoable,
    isUndoAvailable,
    isRedoAvailable,
    onUndo,
    onRedo,
    clearUndo
  };
};

export default useUndoable;
