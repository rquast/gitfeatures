import React, { useContext, useRef } from 'react';
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
import useTree from '../../hooks/useTree';
import EmoticonPicker from '../picker/EmoticonPicker';
import useCreateTreeNode from '../../hooks/useCreateTreeNode';
import { useForm } from 'react-hook-form';
import { isValidSlug, parseTitleForSlug } from '../../utils/SlugUtils';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';

function ChangeTreeNodeModal() {
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const { setValue, handleSubmit, errors, register } = useForm();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const slugParts = useRef<{ title: string; slug?: string }>({ title: '' });

  const titleRef: any = useRef<HTMLInputElement | null>(null);

  const createTreeNode = useCreateTreeNode();

  const {
    isTreeNodeModalOpen,
    onCloseTreeNodeModal,
    treeNodeModalView,
    treeNodeModalMode
  } = useTree();

  const closeModal = () => {
    onClose();
    onCloseTreeNodeModal();
  };

  const createNewNode = () => {
    createTreeNode(
      treeNodeModalView,
      slugParts.current.title,
      slugParts.current.slug
    );
    closeModal();
  };

  const toggleEmoticons = () => {
    if (!isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };

  const insertEmoticon = (value: string) => {
    const index = titleRef.current.selectionStart;
    if (index >= 0) {
      setValue(
        'title',
        titleRef.current.value.slice(0, index) +
          value +
          titleRef.current.value.slice(index)
      );
    } else {
      setValue('title', titleRef.current.value + value);
    }
  };

  function validateTitle(value: string) {
    const length = value.trim().length;
    if (length < 64) {
      try {
        const parsedTitle = parseTitleForSlug(
          value,
          specificationContext.state.tree
        );
        if (parsedTitle) {
          slugParts.current = parsedTitle;
          if (parsedTitle.slug) {
            if (exampleMapContext.state.trees) {
              for (const key of Object.keys(exampleMapContext.state.trees)) {
                isValidSlug(
                  parsedTitle.slug,
                  exampleMapContext.state.trees[key].tree
                );
              }
            }
          }
        }
        return true;
      } catch (err: any) {
        return err.message;
      }
    } else {
      return 'Not a valid title: must be less than 64 characters';
    }
  }

  const titleRefHandler = (ref: HTMLInputElement) => {
    titleRef.current = ref;
    register(ref, { validate: validateTitle });
    ref?.focus();
  };

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isTreeNodeModalOpen}
      onClose={closeModal}
      initialFocusRef={titleRef}
      returnFocusOnClose={false}
    >
      {isTreeNodeModalOpen && (
        <form onSubmit={handleSubmit(createNewNode)}>
          <ModalOverlay />
          <ModalContent minWidth={600}>
            <ModalHeader textTransform="capitalize">
              {treeNodeModalMode} {treeNodeModalView}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isInvalid={errors['title']} isRequired>
                <FormLabel htmlFor="title">Title</FormLabel>
                <Stack direction="row" spacing={2} mb={4}>
                  <Input
                    name="title"
                    placeholder="Add a title ..."
                    ref={titleRefHandler}
                  />
                  <Button fontSize="xl" onClick={toggleEmoticons}>
                    😀
                  </Button>
                </Stack>
                <FormErrorMessage>
                  {errors['title'] && errors['title'].message}
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
                Create
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

export default ChangeTreeNodeModal;
