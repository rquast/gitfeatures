import React, { useContext } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import EmoticonPicker from '../picker/EmoticonPicker';
import useAppState from '../../hooks/useAppState';
import { store as appStateStore } from '../../context/AppStateContext';

function EmoticonPickerModal() {
  const appStateContext = useContext(appStateStore);

  const {
    isEmoticonPickerModalOpen,
    onInsertValueEvent,
    onCloseEmoticonPickerModal
  } = useAppState();

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isEmoticonPickerModalOpen}
      onClose={onCloseEmoticonPickerModal}
    >
      <ModalOverlay />
      <ModalContent minWidth={600}>
        <ModalHeader>Insert Emoticon</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EmoticonPicker
            isOpen={true}
            onClose={onCloseEmoticonPickerModal}
            callback={onInsertValueEvent}
            eventKey={appStateContext.state.emoticonPickerModal?.eventKey}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onCloseEmoticonPickerModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EmoticonPickerModal;
