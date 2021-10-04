import { MoonIcon, SunIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  IconButton,
  useColorMode,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  InputRightElement,
  Flex,
  Tooltip
} from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { revertChanges, pushBranch } from '../../persistence/GitStorage';
import useAppState from '../../hooks/useAppState';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import { store as appStateStore } from '../../context/AppStateContext';
import {
  FaAngleDown,
  FaCodeBranch,
  FaGit,
  FaUndoAlt,
  FaRedoAlt
} from 'react-icons/fa';
import touchedAction from '../../actions/touchedAction';
import reloadAction from '../../actions/reloadAction';
import useUndoable from '../../hooks/useUndoable';
import configStub from '../../stubs/configStub';
import { resetSessionValues } from '../../utils/SessionUtils';

function ResponsiveHeader() {
  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const currentURLRef = useRef<HTMLInputElement | null>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelConfirmRef = useRef<HTMLButtonElement | null>(null);
  const repositorySelectorRef = useRef<HTMLDivElement | null>(null);

  const [currentRepository, setCurrentRepository] = useState('');
  const [confirmDetails, setConfirmDetails] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const {
    config,
    isLocalTreeStateDifferent,
    currentRepositoryURL,
    onOpenSettingsModal
  } = useAppState();

  const { isUndoAvailable, onUndo, isRedoAvailable, onRedo } = useUndoable();

  const { colorMode, toggleColorMode } = useColorMode();

  const [actionButtonLocked, setActionButtonLocked] = useState<boolean>(false);
  const [showRepositorySelector, setShowRepositorySelector] = useState<boolean>(
    false
  );

  const [lastUndoAction, setLastUndoAction] = useState<string>('');
  const [nextRedoAction, setNextRedoAction] = useState<string>('');

  const toast = useToast();

  const onClickSettings = () => {
    onOpenSettingsModal();
  };

  const parseCurrentRepository = (url: string) => {
    if (url && url.trim().length > 0) {
      return url;
    }

    let config;
    const element = document.querySelector('meta[name="gf:config"]');
    if (element) {
      try {
        config = JSON.parse(
          decodeURIComponent(
            // @ts-ignore
            element.content
          )
        );
      } catch (e) {
        console.error('Could not parse config meta tag', e);
      }
    }

    if (!config) {
      config = JSON.parse(JSON.stringify(configStub));
    }

    return config.currentRepositoryURL + '';
  };

  const onRepositoryChange = (evt: React.FocusEvent<HTMLInputElement>) => {
    const url = parseCurrentRepository(evt.target.value + '');
    if (url !== currentRepositoryURL) {
      (() => {
        appStateContext.dispatch({
          type: 'SET_CURRENT_REPOSITORY_URL',
          payload: url
        });
        appStateContext.dispatch(touchedAction());
        exampleMapContext.dispatch(reloadAction());
        specificationContext.dispatch(reloadAction(true));
        appStateContext.dispatch(reloadAction());
      })();
    }
  };

  const onClone = async (
    evt: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<any>
  ) => {
    evt.target.blur();
    appStateContext.dispatch({
      type: 'CHANGE_GIT_ACTIONS_MODAL',
      payload: { view: 'clone-repository', isOpen: true }
    });
  };

  const onCommit = async (
    evt: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<any>
  ) => {
    evt.target.blur();
    appStateContext.dispatch({
      type: 'CHANGE_GIT_ACTIONS_MODAL',
      payload: { view: 'commit', isOpen: true }
    });
  };

  const onPush = async (
    evt: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<any>
  ) => {
    evt.target.blur();
    setConfirmDetails({
      title: 'Push',
      message: 'Are you sure you want to push to the remote repository?',
      action: doPush
    });
    onOpen();
  };

  const doPush = async () => {
    if (!config || !currentRepositoryURL) {
      return;
    }
    setActionButtonLocked(true);
    try {
      await pushBranch(currentRepositoryURL, config);
      toast({
        title: 'Push Successful.',
        description: "We've successfully pushed your repository.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    } catch (err: any) {
      toast({
        title: 'Push Failed.',
        description: err.message,
        status: 'error',
        duration: 9000,
        isClosable: true
      });
      console.log(err);
    } finally {
      setActionButtonLocked(false);
    }
  };

  const onRollback = async (
    evt: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<any>
  ) => {
    evt.target.blur();
    setConfirmDetails({
      title: 'Rollback Changes',
      message: 'Are you sure you want to rollback uncommitted changes?',
      action: doRollback
    });
    onOpen();
  };

  const doRollback = async () => {
    if (!currentRepositoryURL) {
      return;
    }
    setActionButtonLocked(true);
    try {
      await revertChanges(currentRepositoryURL);
      toast({
        title: 'Rollback Successful.',
        description:
          "We've successfully rolled back your repository to its current state.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      resetSessionValues(currentRepositoryURL);
      specificationContext.dispatch(reloadAction(true));
      exampleMapContext.dispatch(reloadAction());
      appStateContext.dispatch(reloadAction(true));
    } catch (err: any) {
      setActionButtonLocked(false);
      toast({
        title: 'Rollback Failed.',
        description: err.message,
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }
  };

  const keydownHandler = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement> | any) => {
      if (evt.keyCode === 13) {
        evt.target.blur();
      }
    },
    []
  );

  useEffect(() => {
    if (currentRepositoryURL) {
      setCurrentRepository(currentRepositoryURL + '');
    }
  }, [currentRepositoryURL]);

  useEffect(() => {
    const inputEl = currentURLRef?.current;
    if (inputEl) {
      inputEl.addEventListener('keydown', keydownHandler, false);
    }
    return () => {
      if (inputEl) {
        inputEl.removeEventListener('keydown', keydownHandler, false);
      }
    };
  }, [currentURLRef.current]);

  useEffect(() => {
    if (
      Array.isArray(appStateContext.state.undoStack) &&
      appStateContext.state.undoStack.length > 0
    ) {
      const { descriptions } = appStateContext.state.undoStack[
        appStateContext.state.undoStack.length - 1
      ];
      if (descriptions && descriptions.length > 0) {
        setLastUndoAction('Undo: ' + descriptions.join(' - '));
      } else {
        setLastUndoAction(`${appStateContext.state.undoStack.length}`);
      }
    }
  }, [appStateContext.state.undoStack]);

  useEffect(() => {
    if (
      Array.isArray(appStateContext.state.redoStack) &&
      appStateContext.state.redoStack.length > 0
    ) {
      const { descriptions } = appStateContext.state.redoStack[
        appStateContext.state.redoStack.length - 1
      ];
      if (descriptions && descriptions.length > 0) {
        setNextRedoAction('Redo: ' + descriptions.join(' - '));
      } else {
        setNextRedoAction(`${appStateContext.state.redoStack.length}`);
      }
    }
  }, [appStateContext.state.redoStack]);

  const selectRepository = (url: string) => {
    url = parseCurrentRepository(url);
    setShowRepositorySelector(false);
    setCurrentRepository(url);
    (() => {
      appStateContext.dispatch({
        type: 'SET_CURRENT_REPOSITORY_URL',
        payload: url
      });
      appStateContext.dispatch(touchedAction());
      exampleMapContext.dispatch(reloadAction());
      specificationContext.dispatch(reloadAction(true));
    })();
  };

  useEffect(() => {
    if (showRepositorySelector && repositorySelectorRef.current) {
      repositorySelectorRef.current.focus();
    }
  }, [showRepositorySelector]);

  return (
    <>
      <Stack direction="row" pt={6} pb={4} pl={8} pr={12}>
        <Stack flexGrow={1} spacing={0}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={
                <FaGit color={colorMode === 'dark' ? 'white' : 'gray'} />
              }
            />
            <Input
              ref={currentURLRef}
              value={currentRepository}
              size="md"
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentRepository(evt.target.value + '')
              }
              onBlur={onRepositoryChange}
              isDisabled={actionButtonLocked}
            />
            <InputRightElement
              pointerEvents="auto"
              cursor="pointer"
              children={
                <FaAngleDown color={colorMode === 'dark' ? 'white' : 'gray'} />
              }
              onClick={() => setShowRepositorySelector(!showRepositorySelector)}
            />
          </InputGroup>
          {showRepositorySelector && (
            <Flex position="relative" flexGrow={1}>
              <Flex
                tabIndex={-1}
                position="absolute"
                right={0}
                top={2}
                p={2}
                borderRadius="md"
                clear="both"
                borderWidth="1px"
                bg={colorMode === 'dark' ? 'gray.900' : 'white'}
                ref={repositorySelectorRef}
                onBlur={(evt: React.FocusEvent<HTMLDivElement>) => {
                  if (
                    !repositorySelectorRef.current?.contains(
                      evt.relatedTarget as Node
                    )
                  ) {
                    setShowRepositorySelector(false);
                  }
                }}
              >
                <Stack
                  spacing={0}
                  flexGrow={1}
                  maxHeight="300px"
                  overflowY="auto"
                >
                  {Object.keys(
                    appStateContext.state?.config?.localRepositories || {}
                  ).map((key) => {
                    return (
                      <React.Fragment key={key}>
                        <Box
                          p={2}
                          userSelect="none"
                          cursor="pointer"
                          flexGrow={1}
                          onClick={() => selectRepository(key)}
                          tabIndex={-1}
                          _hover={{
                            bg: colorMode === 'dark' ? 'gray.600' : 'gray.200'
                          }}
                          borderRadius="sm"
                        >
                          {key}
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Stack>
              </Flex>
            </Flex>
          )}
        </Stack>
        <Popover>
          <PopoverTrigger>
            {isLocalTreeStateDifferent ? (
              <Button
                colorScheme="red"
                variant="outline"
                size="md"
                mr={10}
                isDisabled={actionButtonLocked}
              >
                <Box pr={2}>
                  <FaCodeBranch />
                </Box>
                Uncommitted Changes
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                variant="outline"
                size="md"
                mr={10}
                isDisabled={actionButtonLocked}
              >
                <Box pr={2}>
                  <FaCodeBranch />
                </Box>
                Git Actions
              </Button>
            )}
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Actions</PopoverHeader>
              <PopoverBody>
                <Stack spacing={4} mt={2} mb={2}>
                  {isLocalTreeStateDifferent && (
                    <Stack isInline alignItems="center" spacing={4}>
                      <Button onClick={onRollback} minWidth="120px">
                        Rollback
                      </Button>
                      <Box flexGrow={1}>Rollback changes from local branch</Box>
                    </Stack>
                  )}
                  <Stack isInline alignItems="center" spacing={4}>
                    <Button onClick={onClone} minWidth="120px">
                      Clone
                    </Button>
                    <Box flexGrow={1}>Clone or initialize a repository</Box>
                  </Stack>
                  {isLocalTreeStateDifferent && (
                    <Stack isInline alignItems="center" spacing={4}>
                      <Button
                        onClick={onCommit}
                        minWidth="120px"
                        colorScheme={
                          isLocalTreeStateDifferent ? 'green' : 'gray'
                        }
                      >
                        Commit
                      </Button>
                      <Box flexGrow={1}>Commit changes to local branch</Box>
                    </Stack>
                  )}
                  <Stack isInline alignItems="center" spacing={4}>
                    <Button onClick={onPush} minWidth="120px">
                      Push
                    </Button>
                    <Box>Push local branch to remote</Box>
                  </Stack>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Tooltip hasArrow label={lastUndoAction} bg="red.600" color="white">
          <IconButton
            onClick={() => onUndo()}
            size="md"
            variant="ghost"
            aria-label="Undo"
            disabled={!isUndoAvailable}
            icon={
              colorMode === 'dark' ? (
                <FaUndoAlt />
              ) : (
                <FaUndoAlt color="rgb(113, 128, 150)" />
              )
            }
          />
        </Tooltip>
        <Tooltip hasArrow label={nextRedoAction} bg="red.600" color="white">
          <IconButton
            onClick={() => onRedo()}
            size="md"
            variant="ghost"
            aria-label="Redo"
            disabled={!isRedoAvailable}
            icon={
              colorMode === 'dark' ? (
                <FaRedoAlt />
              ) : (
                <FaRedoAlt color="rgb(113, 128, 150)" />
              )
            }
          />
        </Tooltip>
        <Tooltip hasArrow label="Toggle Dark Mode" bg="blue.600" color="white">
          <IconButton
            onClick={toggleColorMode}
            size="md"
            variant="ghost"
            aria-label="Toggle Dark Mode"
            icon={
              colorMode === 'dark' ? <SunIcon /> : <MoonIcon color="gray.500" />
            }
          />
        </Tooltip>
        <Tooltip hasArrow label="Settings" bg="blue.600" color="white">
          <IconButton
            onClick={onClickSettings}
            size="md"
            variant="ghost"
            aria-label="Settings"
            icon={
              colorMode === 'dark' ? (
                <SettingsIcon />
              ) : (
                <SettingsIcon color="gray.500" />
              )
            }
          />
        </Tooltip>
      </Stack>
      <AlertDialog
        motionPreset="scale"
        leastDestructiveRef={cancelConfirmRef}
        onClose={onClose}
        isOpen={isOpen}
        blockScrollOnMount={false}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{confirmDetails?.title}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{confirmDetails?.message}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelConfirmRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="green"
              ml={3}
              onClick={() => {
                onClose();
                confirmDetails?.action();
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ResponsiveHeader;
