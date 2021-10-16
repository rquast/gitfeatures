import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import useAppState from '../../hooks/useAppState';
import { addCommit, pushBranch } from '../../persistence/GitStorage';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import { useForm } from 'react-hook-form';
import EmoticonPicker from '../picker/EmoticonPicker';
import touchedAction from '../../actions/touchedAction';

function CommitChangesModalView() {
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const { setValue, getValues, handleSubmit, errors, register } = useForm();
  const commitMessageRef = useRef<HTMLInputElement | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const {
    config,
    currentRepositoryURL,
    onCloseGitActionsModal,
    isCommitPushChecked,
    onToggleCommitPushChecked
  } = useAppState();

  const closeModal = () => {
    onCloseGitActionsModal();
  };

  const onCommit = useCallback(async (values: any) => {
    if (!config || !currentRepositoryURL) {
      return;
    }
    onCloseGitActionsModal();
    const message = values['commit-message'] || 'Changes from ' + Date.now();
    try {
      await addCommit(currentRepositoryURL, message, config);
      toast({
        title: 'Commit Successful.',
        description: "We've successfully committed changes to your repository.",
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      specificationContext.dispatch(touchedAction(true));
      exampleMapContext.dispatch(touchedAction(true));
      if (values['commit-push']) {
        await doPush();
      }
    } catch (err: any) {
      toast({
        title: 'Commit Failed.',
        description: err.message,
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }
  }, []);

  const doPush = async () => {
    if (!config || !currentRepositoryURL) {
      return;
    }
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
    }
  };

  function validateCommitMessage(value: string) {
    const length = value.trim().length;
    if (length < 256) {
      return true;
    } else {
      return 'Not a valid commit message';
    }
  }

  const toggleEmoticons = () => {
    if (!isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };

  const insertEmoticon = (value: string) => {
    const values = getValues();
    const index: number = commitMessageRef.current?.selectionStart || -1;
    if (index >= 0) {
      setValue(
        'commit-message',
        values['commit-message'].slice(0, index) +
          value +
          values['commit-message'].slice(index)
      );
    } else {
      setValue('commit-message', values['commit-message'] + value);
    }
  };

  useEffect(() => {
    if (commitMessageRef.current) {
      register(commitMessageRef.current, { validate: validateCommitMessage });
      commitMessageRef.current.focus();
    }
  }, []);

  return (
    <ModalContent minWidth={600}>
      <form onSubmit={handleSubmit(onCommit)}>
        <ModalHeader>Commit Changes</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            <FormControl isInvalid={errors['commit-message']} isRequired>
              <FormLabel htmlFor="commit-message">Commit message</FormLabel>
              <Stack spacing={6}>
                <Stack isInline>
                  <Input
                    name="commit-message"
                    placeholder="Add a commit message ..."
                    ref={commitMessageRef}
                  />
                  <Button fontSize="xl" onClick={toggleEmoticons}>
                    😀
                  </Button>
                </Stack>
                <Stack>
                  <Checkbox
                    name="commit-push"
                    ref={register()}
                    defaultIsChecked={isCommitPushChecked}
                    onChange={() => onToggleCommitPushChecked()}
                  >
                    Push automatically after committing
                  </Checkbox>
                </Stack>
              </Stack>
              <FormErrorMessage>
                {errors['commit-message'] && errors['commit-message'].message}
              </FormErrorMessage>
            </FormControl>
            <EmoticonPicker
              isOpen={isOpen}
              onClose={onClose}
              callback={insertEmoticon}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} type="submit">
            Commit
          </Button>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}

export default CommitChangesModalView;
