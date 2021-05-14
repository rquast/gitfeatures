import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import { AttachmentIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  deleteFileFromRepo,
  uploadFileToRepo,
  listFilesInRepo,
  fetchFileAsBlob
} from '../../persistence/GitStorage';
import { store as specificationStore } from '../../context/SpecificationContext';
import { FaCode, FaImage } from 'react-icons/fa';
import { store as appStateStore } from '../../context/AppStateContext';
import touchedAction from '../../actions/touchedAction';

const ALLOWED_IMAGE_EXTENSIONS = [
  'svg',
  'apng',
  'avif',
  'gif',
  'jpeg',
  'jpg',
  'png',
  'webp'
];

function isFileAnImage(filename: string) {
  const parts = filename.split('.');
  if (parts.length > 0) {
    return ALLOWED_IMAGE_EXTENSIONS.includes(
      parts.pop()?.trim().toLowerCase() || ''
    );
  } else {
    return false;
  }
}

function FilesModal() {
  const [files, setFiles] = useState<string[]>([]);
  const [isConfirmDeleteFile, setIsConfirmDeleteFile] = useState(false);
  const [fileToDelete, setFileToDelete]: [any, any] = useState(false);

  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);

  const toast = useToast();

  const cancelDeleteRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    isFilesModalOpen,
    onCloseFilesModal,
    currentRepositoryURL,
    onInsertValueEvent
  } = useAppState();

  const onDeleteFile = (key: string) => {
    setFileToDelete(key);
    setIsConfirmDeleteFile(true);
    if (cancelDeleteRef.current) {
      cancelDeleteRef.current.focus();
    }
  };

  const onChangeFileInput = () => {
    if (!currentRepositoryURL) {
      return;
    }
    const files = fileInputRef.current?.files;
    if (files && files[0]) {
      const fileData = files[0];
      const reader = new FileReader();
      reader.onload = async (evt: ProgressEvent<FileReader>) => {
        const buffer: any = evt.target?.result;
        if (buffer) {
          await uploadFileToRepo(
            currentRepositoryURL,
            fileData.name,
            new Uint8Array(buffer)
          );
          specificationContext.dispatch(touchedAction());
        }
      };
      reader.readAsArrayBuffer(fileData);
    }
  };

  const onInsertFileMarkdown = (file: string) => {
    onInsertValueEvent(
      '\n```file\n' + file + '\n```\n',
      appStateContext.state.filesModal.eventKey
    );
    closeModal();
  };

  const onInsertImageMarkdown = (file: string) => {
    onInsertValueEvent(
      '\n```image\n' + file + '\n```\n',
      appStateContext.state.filesModal.eventKey
    );
    closeModal();
  };

  const onDownloadFile = async (file: string) => {
    if (!currentRepositoryURL) {
      return;
    }
    const fileContent: Blob | null = await fetchFileAsBlob(
      currentRepositoryURL,
      '/files/' + file
    );
    if (fileContent) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(fileContent);
      link.setAttribute('download', file);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
  };

  const onClickConfirmDeleteFile = async () => {
    if (!currentRepositoryURL) {
      return;
    }
    setIsConfirmDeleteFile(false);
    await deleteFileFromRepo(currentRepositoryURL, fileToDelete);
    specificationContext.dispatch(touchedAction());
    toast({
      title: 'Removed File.',
      description: "We've successfully removed this file from the repository.",
      status: 'success',
      duration: 9000,
      isClosable: true
    });
  };

  const closeModal = () => {
    onCloseFilesModal();
  };

  useEffect(() => {
    if (isFilesModalOpen && currentRepositoryURL) {
      listFilesInRepo(currentRepositoryURL, '/files').then((newFiles) => {
        setFiles(newFiles);
      });
    }
  }, [specificationContext.state]);

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isFilesModalOpen}
      onClose={closeModal}
    >
      <ModalOverlay />
      <ModalContent minWidth={600}>
        <ModalHeader textTransform="capitalize">Files</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box fontWeight="bold" mb={4}>
            Files uploaded here will be added to the "files" folder of your
            repository. Keep files to a minimum to avoid slow cloning.
          </Box>
          <Divider />
          <Flex direction="column" maxHeight="50vh" overflowY="auto">
            <Stack spacing={6} flexGrow={1}>
              {files.map((file: string) => {
                return (
                  <React.Fragment key={file}>
                    <Stack
                      value={file}
                      flexGrow={1}
                      spacing={2}
                      mt={4}
                      mr={4}
                      isInline
                    >
                      <Stack flexGrow={1} overflow="hidden">
                        <Box flexGrow={1}>{file}</Box>
                      </Stack>
                      {isFileAnImage(file) && (
                        <Tooltip
                          hasArrow
                          label="Embed Image"
                          bg="blue.600"
                          color="white"
                        >
                          <IconButton
                            aria-label="Embed Image"
                            isDisabled={isConfirmDeleteFile}
                            icon={<FaImage />}
                            onClick={() => onInsertImageMarkdown(file)}
                          />
                        </Tooltip>
                      )}
                      <Tooltip
                        hasArrow
                        label="Embed File"
                        bg="blue.600"
                        color="white"
                      >
                        <IconButton
                          aria-label="Embed File"
                          isDisabled={isConfirmDeleteFile}
                          icon={<FaCode />}
                          onClick={() => onInsertFileMarkdown(file)}
                        />
                      </Tooltip>
                      <Tooltip
                        hasArrow
                        label="Download File"
                        bg="blue.600"
                        color="white"
                      >
                        <IconButton
                          aria-label="Download File"
                          isDisabled={isConfirmDeleteFile}
                          icon={<DownloadIcon />}
                          onClick={() => onDownloadFile(file)}
                        />
                      </Tooltip>
                      <Tooltip
                        hasArrow
                        label="Delete File"
                        bg="red.600"
                        color="white"
                      >
                        <IconButton
                          aria-label="Delete File"
                          isDisabled={isConfirmDeleteFile}
                          icon={<DeleteIcon />}
                          onClick={() => onDeleteFile(file)}
                        />
                      </Tooltip>
                    </Stack>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </Stack>
          </Flex>
          <Collapse in={isConfirmDeleteFile} animateOpacity>
            <Stack
              spacing={4}
              mt={4}
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
            >
              <Box>Are you sure you want to delete this file?</Box>
              <Stack isInline>
                <Button
                  ref={cancelDeleteRef}
                  onClick={() => setIsConfirmDeleteFile(false)}
                >
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={onClickConfirmDeleteFile}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Collapse>
          <Stack mt={4}>
            <form>
              <Input
                type="file"
                accept="*"
                ref={fileInputRef}
                onChange={onChangeFileInput}
                name="file-upload"
                style={{ display: 'none' }}
              />
              <Button
                colorScheme="green"
                onClick={() => fileInputRef.current?.click()}
                rightIcon={<AttachmentIcon />}
              >
                Upload
              </Button>
            </form>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FilesModal;
