import React, { useRef } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure
} from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import useTree from '../../hooks/useTree';
import { useForm } from 'react-hook-form';
import EmoticonPicker from '../picker/EmoticonPicker';
import addTagAction from '../../actions/addTagAction';
import touchedAction from '../../actions/touchedAction';
import useUndoable from '../../hooks/useUndoable';

function AddTagModal() {
  const { setValue, handleSubmit, errors, register } = useForm();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tagInputRef = useRef<HTMLInputElement | null>(null);

  const { isAddTagModalOpen, onCloseAddTagModal } = useAppState();
  const { currentSpecNode } = useTree();
  const { undoable } = useUndoable();

  const onAdd = (values: any) => {
    if (currentSpecNode) {
      undoable([
        { type: 'spec', action: addTagAction(currentSpecNode, values) },
        { type: 'spec', action: touchedAction() }
      ]);
    }
    closeModal();
  };

  const closeModal = () => {
    onClose();
    onCloseAddTagModal();
  };

  function validateTag(value: string) {
    // TODO: needs better validation
    const length = value.trim().length;
    if (length < 64) {
      return true;
    } else {
      return 'Not a valid tag: must be less than 64 characters';
    }
  }

  const tagRefHandler = (ref: any) => {
    tagInputRef.current = ref;
    register(ref, { validate: validateTag });
    ref?.focus();
  };

  const insertEmoticon = (value: string) => {
    if (tagInputRef.current) {
      const index: number = tagInputRef.current?.selectionStart || -1;
      if (index >= 0) {
        setValue(
          'tag',
          tagInputRef.current.value.slice(0, index) +
            value +
            tagInputRef.current.value.slice(index)
        );
      } else {
        setValue('tag', tagInputRef.current.value + value);
      }
    }
  };

  const toggleEmoticons = () => {
    if (!isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isAddTagModalOpen}
      onClose={closeModal}
    >
      {isAddTagModalOpen && (
        <form onSubmit={handleSubmit(onAdd)}>
          <ModalOverlay />
          <ModalContent minWidth={600}>
            <ModalHeader textTransform="capitalize">Add Tag</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isInvalid={errors['tag']} isRequired>
                <FormLabel htmlFor="tag">Tag</FormLabel>
                <Stack direction="row" spacing={2} mb={4}>
                  <Input
                    name="tag"
                    placeholder="Add a tag ..."
                    ref={tagRefHandler}
                  />
                  <Button fontSize="xl" onClick={toggleEmoticons}>
                    😀
                  </Button>
                </Stack>
                <FormErrorMessage>
                  {errors['tag'] && errors['tag'].message}
                </FormErrorMessage>
              </FormControl>
              <EmoticonPicker
                isOpen={isOpen}
                onClose={onClose}
                callback={insertEmoticon}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                Add
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      )}
    </Modal>
  );
}

export default AddTagModal;
