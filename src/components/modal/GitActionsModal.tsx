import React, { useContext } from 'react';
import { Modal, ModalOverlay } from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import { store as appStateStore } from '../../context/AppStateContext';
import CloneRepositoryModalView from './CloneRepositoryModalView';
import CommitChangesModalView from './CommitChangesModalView';

function GitActionsModal({ cloneFn, initFn }: { cloneFn?: any; initFn?: any }) {
  const appStateContext = useContext(appStateStore);
  const { isGitActionsModalOpen, onCloseGitActionsModal } = useAppState();

  const closeModal = () => {
    onCloseGitActionsModal();
  };
  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isGitActionsModalOpen}
      onClose={closeModal}
    >
      <ModalOverlay />
      {appStateContext.state.gitActionsModal?.view === 'clone-repository' && (
        <CloneRepositoryModalView cloneFn={cloneFn} initFn={initFn} />
      )}
      {appStateContext.state.gitActionsModal?.view === 'commit' && (
        <CommitChangesModalView />
      )}
    </Modal>
  );
}

export default GitActionsModal;
