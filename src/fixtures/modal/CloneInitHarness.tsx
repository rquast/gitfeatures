import React, { useContext, useEffect } from 'react';
import type { Action, GitProfile } from '../../types';
import GitActionsModal from '../../components/modal/GitActionsModal';
import { store as appStateStore } from '../../context/AppStateContext';

function mockCloneRepo(
  currentRepositoryURL: string,
  gitProfile: GitProfile
): Promise<void> {
  console.log('PERFORM CLONE', currentRepositoryURL, gitProfile);
  return Promise.resolve();
}

function mockInitRepo(
  currentRepositoryURL: string,
  defaultBranch: string,
  remoteName: string
): Promise<void> {
  console.log('PERFORM INIT', currentRepositoryURL, defaultBranch, remoteName);
  return Promise.resolve();
}

function CloneInitHarness({ action }: { action: Action | null }) {
  const appStateContext = useContext(appStateStore);

  useEffect(() => {
    if (action) {
      appStateContext.dispatch(action);
    }
  }, [action]);

  return <GitActionsModal cloneFn={mockCloneRepo} initFn={mockInitRepo} />;
}

export default CloneInitHarness;
