import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Button,
  Stack,
  IconButton,
  useToast,
  Collapse,
  Box,
  Divider,
  Flex,
  Tag,
  TagLabel,
  Tooltip
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import { store as appStateStore } from '../../context/AppStateContext';
import {
  deleteLocalRepository,
  downloadLocalRepository
} from '../../persistence/GitStorage';
import touchedAction from '../../actions/touchedAction';

const LocalRepositoriesModalView = () => {
  const appStateContext = useContext(appStateStore);

  const cancelDeleteRef: any = useRef();

  const [localRepositories, setLocalRepositories]: [any, any] = useState({});

  const [
    isConfirmDeleteLocalRepository,
    setIsConfirmDeleteLocalRepository
  ] = useState(false);
  const [localRepositoryToDelete, setLocalRepositoryToDelete]: [
    any,
    any
  ] = useState(false);

  const toast = useToast();

  const loadLocalRepositories = async (data: any) => {
    await setLocalRepositories(JSON.parse(JSON.stringify(data)));
  };

  const onDeleteLocalRepository = (key: string) => {
    setLocalRepositoryToDelete(key);
    setIsConfirmDeleteLocalRepository(true);
    cancelDeleteRef.current.focus();
  };

  const onDownloadLocalRepository = async (key: string) => {
    const fileContent: Blob = await downloadLocalRepository(key);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fileContent);
    link.setAttribute('download', 'repository.zip');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const onClickConfirmDeleteLocalRepository = async () => {
    setIsConfirmDeleteLocalRepository(false);
    await deleteLocalRepository(localRepositoryToDelete);
    await appStateContext.dispatch({
      type: 'DELETE_LOCAL_REPOSITORY',
      payload: localRepositoryToDelete
    });
    await appStateContext.dispatch(touchedAction());
    toast({
      title: 'Removed Local Repository.',
      description: "We've successfully removed this local repository.",
      status: 'success',
      duration: 9000,
      isClosable: true
    });
  };

  useEffect(() => {
    if (appStateContext.state.config?.localRepositories) {
      loadLocalRepositories(appStateContext.state.config.localRepositories);
    }
  }, [
    appStateContext.state.config?.localRepositories,
    appStateContext.state.touched
  ]);

  return (
    <Stack spacing={6}>
      <Box fontWeight="bold">
        Local copies of repositories are stored in your browser when they are
        either cloned or initialized. When making changes to specifications, be
        sure to push them frequently.
      </Box>
      <Flex direction="column" maxHeight="50vh" overflowY="auto">
        <Stack spacing={6} flexGrow={1}>
          {Object.keys(localRepositories).map((key) => {
            const localRepository = localRepositories[key];
            return (
              <React.Fragment key={key}>
                <Divider />
                <Stack value={key} flexGrow={1} spacing={2} mr={4} isInline>
                  <Stack flexGrow={1} overflow="hidden">
                    <Box flexGrow={1}>{key}</Box>
                    <Stack isInline>
                      <Tag size="sm" variant="outline" colorScheme="blue">
                        <TagLabel>
                          {localRepository['git-profile-name']}
                        </TagLabel>
                      </Tag>
                      <Tag size="sm" variant="outline" colorScheme="green">
                        <TagLabel>{localRepository['current-branch']}</TagLabel>
                      </Tag>
                    </Stack>
                  </Stack>
                  <Tooltip
                    hasArrow
                    label="Download Local Repository"
                    bg="blue.600"
                    color="white"
                  >
                    <IconButton
                      aria-label="Download Local Repository"
                      isDisabled={isConfirmDeleteLocalRepository}
                      icon={<DownloadIcon />}
                      onClick={() => onDownloadLocalRepository(key)}
                    />
                  </Tooltip>
                  <Tooltip
                    hasArrow
                    label="Delete Local Repository"
                    bg="red.600"
                    color="white"
                  >
                    <IconButton
                      aria-label="Delete Local Repository"
                      isDisabled={isConfirmDeleteLocalRepository}
                      icon={<DeleteIcon />}
                      onClick={() => onDeleteLocalRepository(key)}
                    />
                  </Tooltip>
                </Stack>
              </React.Fragment>
            );
          })}
        </Stack>
      </Flex>
      <Collapse in={isConfirmDeleteLocalRepository} animateOpacity>
        <Stack
          spacing={4}
          mt={4}
          p={4}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
        >
          <Box>Are you sure you want to delete this local repository?</Box>
          <Stack isInline>
            <Button
              ref={cancelDeleteRef}
              onClick={() => setIsConfirmDeleteLocalRepository(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onClickConfirmDeleteLocalRepository}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default LocalRepositoriesModalView;
