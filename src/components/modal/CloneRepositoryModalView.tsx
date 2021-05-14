import {
  Box,
  Button,
  FormControl,
  FormLabel,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  useToast
} from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useAppState from '../../hooks/useAppState';
import { cloneRepo, initRepo } from '../../persistence/GitStorage';
import { store as appStateStore } from '../../context/AppStateContext';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import { useForm } from 'react-hook-form';
import touchedAction from '../../actions/touchedAction';
import reloadAction from '../../actions/reloadAction';
import type {
  CloneRepositoryParms,
  GitProfile,
  InitRepositoryParms
} from '../../types';
import { resetSessionValues } from '../../utils/SessionUtils';

function CloneRepositoryModalView({
  cloneFn,
  initFn
}: {
  cloneFn?: CloneRepositoryParms;
  initFn?: InitRepositoryParms;
}) {
  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const cloneButtonRef = useRef<HTMLButtonElement | null>(null);

  const { setValue, getValues, handleSubmit, register } = useForm();
  const toast = useToast();
  const {
    config,
    currentRepositoryURL,
    onCloseGitActionsModal
  } = useAppState();
  const [gitProfiles, setGitProfiles] = useState<{
    [key: string]: GitProfile;
  }>({});
  const [currentProfile, setCurrentProfile] = useState<string>('');

  const closeModal = () => {
    onCloseGitActionsModal();
  };

  const onInit = async (values: any) => {
    onCloseGitActionsModal();
    await doInit(values);
  };

  const doInit = async (values: any) => {
    if (!config || !currentRepositoryURL) {
      return;
    }
    const gitProfile = config.gitProfiles[values['selected-profile']];
    try {
      initFn
        ? await initFn(
            currentRepositoryURL,
            gitProfile['default-branch'],
            gitProfile['remote-name']
          )
        : await initRepo(
            currentRepositoryURL,
            gitProfile['default-branch'],
            gitProfile['remote-name']
          );
      resetSessionValues(currentRepositoryURL);
      appStateContext.dispatch({
        type: 'SET_LOCAL_REPOSITORY',
        payload: {
          key: currentRepositoryURL,
          value: {
            'git-profile-name': gitProfile['profile-name'],
            'current-branch': gitProfile['default-branch']
          }
        }
      });
      appStateContext.dispatch(touchedAction());
      exampleMapContext.dispatch(touchedAction());
      specificationContext.dispatch(touchedAction());
      toast({
        title: 'Initialization Successful.',
        description: "We've successfully created a new local repository.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    } catch (e) {
      toast({
        title: 'Init Failed.',
        description: e.message,
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }
  };

  const onClone = async (values: any) => {
    onCloseGitActionsModal();
    await doClone(values);
  };

  const doClone = async (values: any) => {
    if (!config || !currentRepositoryURL) {
      return;
    }
    const gitProfile = config.gitProfiles[values['selected-profile']];
    try {
      const currentBranch = cloneFn
        ? await cloneFn(currentRepositoryURL, gitProfile)
        : await cloneRepo(currentRepositoryURL, gitProfile);
      toast({
        title: 'Clone Successful.',
        description: "We've successfully cloned and loaded your repository.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      (() => {
        resetSessionValues(currentRepositoryURL);
        appStateContext.dispatch({
          type: 'SET_LOCAL_REPOSITORY',
          payload: {
            key: currentRepositoryURL,
            value: {
              'git-profile-name': gitProfile['profile-name'],
              'current-branch': currentBranch
            }
          }
        });
        appStateContext.dispatch(touchedAction());
        exampleMapContext.dispatch(reloadAction());
        specificationContext.dispatch(reloadAction(true));
        appStateContext.dispatch(reloadAction());
      })();
    } catch (e) {
      toast({
        title: 'Clone Failed.',
        description: e.message,
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }
  };

  const onChangeSelectedProfile = async () => {
    const newProfile = getValues();
    setCurrentProfile(newProfile['selected-profile'] + '');
  };

  const loadGitProfiles = async (data: { [key: string]: GitProfile }) => {
    setGitProfiles(JSON.parse(JSON.stringify(data)));
    if (!currentProfile || currentProfile.trim().length === 0) {
      setCurrentProfile('Default');
    } else if (typeof gitProfiles[currentProfile] !== 'undefined') {
      Object.keys(gitProfiles[currentProfile]).forEach((key: string) => {
        if (key !== 'selected-profile') {
          //@ts-ignore
          setValue(key, gitProfiles[currentProfile][key], {
            shouldDirty: true,
            shouldValidate: false
          });
        }
      });
    }
  };

  useEffect(() => {
    if (appStateContext.state.config?.gitProfiles) {
      loadGitProfiles(appStateContext.state.config.gitProfiles);
    }
  }, [
    appStateContext.state.config?.gitProfiles,
    currentProfile,
    appStateContext.state.touched
  ]);

  useEffect(() => {
    if (cloneButtonRef.current) {
      cloneButtonRef.current.focus();
    }
  }, []);

  return (
    <ModalContent minWidth={600}>
      <ModalHeader>Clone Repository</ModalHeader>
      <ModalCloseButton />
      <form>
        <ModalBody>
          <FormControl>
            <FormLabel htmlFor="selected-profile">
              Clone or initialize a new repository for the current URL?
            </FormLabel>
            <Stack isInline spacing={4} alignItems="center" pt={2}>
              <Box whiteSpace="nowrap">Using Git config:</Box>
              <Select
                name="selected-profile"
                defaultValue={currentProfile}
                onChange={onChangeSelectedProfile}
                ref={register()}
              >
                {Object.keys(gitProfiles).map((key) => {
                  const profile = gitProfiles[key];
                  return (
                    <option key={key} value={key}>
                      {profile['profile-name']}
                    </option>
                  );
                })}
              </Select>
            </Stack>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit(onClone)}
            ref={cloneButtonRef}
          >
            Clone
          </Button>
          <Button mr={3} type="submit" onClick={handleSubmit(onInit)}>
            Initialize
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}

export default CloneRepositoryModalView;
