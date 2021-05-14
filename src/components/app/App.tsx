import React, { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  ListItem,
  UnorderedList
} from '@chakra-ui/react';
import 'focus-visible/dist/focus-visible';
import useTree from '../../hooks/useTree';
import { immutableTreeNodeFilterTargets } from '../../utils/TreeUtils';
import EmoticonPickerModal from '../modal/EmoticonPickerModal';
import useLoadFromBrowser from '../../hooks/useLoadFromBrowser';
import useSelectNode from '../../hooks/useSelectNode';
import useLoadConfig from '../../hooks/useLoadConfig';
import GitActionsModal from '../modal/GitActionsModal';
import SettingsModal from '../modal/SettingsModal';
import FilesModal from '../modal/FilesModal';
import MermaidModal from '../modal/MermaidModal';
import HelpDrawer from '../drawer/HelpDrawer';
import removeTreeNodeAction from '../../actions/removeTreeNodeAction';
import touchedAction from '../../actions/touchedAction';
import ResponsiveLayout from './ResponsiveLayout';
import useUndoable from '../../hooks/useUndoable';
import type { MapNode, SpecNode } from '../../types';
import useAppState from '../../hooks/useAppState';

function App() {
  /* LOAD CONFIG */
  const loadConfig: () => void = useLoadConfig();
  useEffect(() => loadConfig(), [loadConfig]);

  /* LOAD DATA */
  const loadFromBrowser: () => void = useLoadFromBrowser();
  useEffect(() => loadFromBrowser(), [loadFromBrowser]);

  /* SELECT */
  const selectNodeIfNeeded: () => void = useSelectNode();
  useEffect(() => selectNodeIfNeeded(), [selectNodeIfNeeded]);

  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const [targets, setTargets] = useState<JSX.Element[] | null>(null);

  const [loadingTimeout, setLoadingTimeout] = useState<any>();

  const {
    isDeleteSpecNodeModalOpen,
    isDeleteMapNodeModalOpen,
    onCloseDeleteNodeModal,
    currentSpecNode,
    currentSpecState,
    currentMapNode,
    currentMapState
  } = useTree();

  const { undoable } = useUndoable();

  const { loadErrors } = useAppState();

  const listTargets = (): JSX.Element[] => {
    let nodes: SpecNode[] | MapNode[];
    if (isDeleteSpecNodeModalOpen && currentSpecNode && currentSpecState.tree) {
      nodes = immutableTreeNodeFilterTargets(
        currentSpecNode,
        currentSpecState.tree
      );
    } else if (currentMapState && currentMapNode) {
      nodes = immutableTreeNodeFilterTargets(
        currentMapNode,
        currentMapState.tree
      );
    } else {
      nodes = [];
    }

    return nodes.map((node: SpecNode | MapNode) => (
      <ListItem key={node.key}>{node.title}</ListItem>
    ));
  };

  const deleteSelectedNode = (): void => {
    if (isDeleteSpecNodeModalOpen && currentSpecNode) {
      undoable([
        {
          type: 'spec',
          action: removeTreeNodeAction(currentSpecNode)
        },
        { type: 'spec', action: touchedAction() }
      ]);
    } else if (currentMapNode) {
      undoable([
        { type: 'map', action: removeTreeNodeAction(currentMapNode) },
        { type: 'map', action: touchedAction() }
      ]);
    }

    onCloseDeleteNodeModal();
  };

  useEffect(() => {
    if (isDeleteSpecNodeModalOpen || isDeleteMapNodeModalOpen) {
      setTargets(listTargets());
    }
  }, [isDeleteSpecNodeModalOpen, isDeleteMapNodeModalOpen]);

  useEffect(() => {
    if (loadErrors.length > 0 && !loadingTimeout) {
      setLoadingTimeout(
        setTimeout(() => {
          if (loadErrors.length > 0) {
            console.error(loadErrors);
            window.location.reload();
          }
        }, 10000)
      );
    } else if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(undefined);
    }
  }, [loadErrors]);

  return (
    <Flex wrap="nowrap" minHeight="100%">
      {loadErrors.length === 0 && (
        <>
          <ResponsiveLayout />
          <HelpDrawer />
          <SettingsModal />
          <GitActionsModal />
          <FilesModal />
          <EmoticonPickerModal />
          <MermaidModal />
          <AlertDialog
            motionPreset="scale"
            leastDestructiveRef={cancelRef}
            onClose={onCloseDeleteNodeModal}
            isOpen={isDeleteSpecNodeModalOpen || isDeleteMapNodeModalOpen}
            blockScrollOnMount={false}
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>Delete</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody maxHeight="50vh" overflowY="auto">
                <UnorderedList>{targets}</UnorderedList>
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onCloseDeleteNodeModal}>
                  No
                </Button>
                <Button colorScheme="red" ml={3} onClick={deleteSelectedNode}>
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Flex>
  );
}

export default App;
