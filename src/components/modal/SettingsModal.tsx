import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabPanels,
  Tabs,
  TabPanel,
  TabList
} from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import { SmallCloseIcon } from '@chakra-ui/icons';
import GitConfigModalView from './GitCedentialsModalView';
import LocalRepositoriesModalView from './LocalRepositoriesModalView';

function SettingsModal() {
  const { isSettingsModalOpen, onCloseSettingsModal } = useAppState();

  const closeModal = () => {
    onCloseSettingsModal();
  };

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isSettingsModalOpen}
      onClose={closeModal}
    >
      <ModalOverlay />
      <ModalContent minWidth={600}>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs isLazy>
            <TabList>
              <Tab>Git Config</Tab>
              <Tab>Local Copies</Tab>
            </TabList>

            <TabPanels>
              <TabPanel maxHeight="50vh" overflowY="auto">
                {isSettingsModalOpen && <GitConfigModalView />}
              </TabPanel>
              <TabPanel>
                {isSettingsModalOpen && <LocalRepositoriesModalView />}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button onClick={closeModal} leftIcon={<SmallCloseIcon />}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
