import React, { useContext, useEffect, useState } from 'react';
//@ts-ignore
import ReactMarkdown from 'react-markdown/react-markdown.min';
import MarkdownRenderer from '../renderer/MarkdownRenderer';
import {
  Button,
  Flex,
  IconButton,
  Link,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
  useColorMode
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  EditIcon,
  ExternalLinkIcon,
  SmallCloseIcon
} from '@chakra-ui/icons';
import CodeEditor from '../editor/CodeEditor';
import useAppState from '../../hooks/useAppState';
import { FaTag, FaTrash } from 'react-icons/fa';
import touchedAction from '../../actions/touchedAction';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import setNotesAction from '../../actions/setNotesAction';
import useUndoable from '../../hooks/useUndoable';
import useTree from '../../hooks/useTree';

function DocumentView(props: any) {
  const { currentRepositoryURL, onOpenAddTagModal } = useAppState();

  const {
    onOpenDeleteSpecNodeModal,
    onOpenDeleteMapNodeModal,
    currentSpecNode,
    currentMapNode
  } = useTree();

  const { undoable } = useUndoable();

  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const { colorMode } = useColorMode();

  let currentNode: any;
  if (props.type === 'map') {
    currentNode = currentMapNode;
  } else {
    currentNode = currentSpecNode;
  }

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const saveEditing = () => {
    const type = props.type || 'spec';
    undoable([
      { type, action: setNotesAction(currentNode, notes) },
      { type, action: touchedAction() }
    ]);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setNotes(`${currentNode.notes || ''}`);
    setIsEditing(false);
  };

  const onDelete = () => {
    if (currentNode.type === 'map') {
      onOpenDeleteMapNodeModal();
    } else {
      onOpenDeleteSpecNodeModal();
    }
  };

  useEffect(() => {
    if (currentNode) {
      setNotes(currentNode.notes || '');
    }
  }, [
    currentNode,
    specificationContext.state.touched,
    exampleMapContext.state.touched
  ]);

  useEffect(() => {
    if (!isEditing) {
      setTabIndex(0);
    }
  }, [isEditing]);

  return (
    <>
      {currentRepositoryURL && (
        <Tabs index={tabIndex} onChange={handleTabsChange} isLazy={true}>
          <TabList hidden={!isEditing}>
            <Tab>Preview</Tab>
            {isEditing && <Tab>Editor</Tab>}
            {isEditing && <Tab>Combined</Tab>}
          </TabList>

          <TabPanels>
            <TabPanel pt={!isEditing ? 0 : 2} pb={0} pl={0} pr={0}>
              <ReactMarkdown
                allowDangerousHtml={false}
                rawSourcePos={true}
                renderers={MarkdownRenderer({
                  currentRepositoryURL,
                  value: notes,
                  onChange: setNotes,
                  isEditing
                })}
              >
                {notes}
              </ReactMarkdown>
            </TabPanel>
            {isEditing && (
              <TabPanel pl={0} pr={0}>
                <Flex direction="column" flexGrow={1}>
                  <CodeEditor
                    language="markdown"
                    isVisible={isEditing}
                    content={notes}
                    onContentChange={setNotes}
                  />
                  <Stack direction="row">
                    <Stack flexGrow={1} />
                    <Link
                      href="https://www.markdownguide.org/basic-syntax/"
                      mr={12}
                      isExternal
                    >
                      Markdown Syntax Guide <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Stack>
                </Flex>
              </TabPanel>
            )}
            {isEditing && (
              <TabPanel pl={0} pr={0}>
                <Flex direction="row" flexGrow={1}>
                  <Flex direction="column" flexGrow={1} mr={12} maxWidth="50%">
                    <CodeEditor
                      language="markdown"
                      isVisible={isEditing}
                      content={notes}
                      onContentChange={setNotes}
                    />
                    <Stack direction="row">
                      <Stack flexGrow={1} />
                      <Link
                        href="https://www.markdownguide.org/basic-syntax/"
                        mr={12}
                        isExternal
                      >
                        Markdown Syntax Guide <ExternalLinkIcon mx="2px" />
                      </Link>
                    </Stack>
                  </Flex>
                  <Flex
                    direction="column"
                    flexGrow={1}
                    pr={isEditing ? 12 : 0}
                    maxWidth="50%"
                  >
                    <ReactMarkdown
                      allowDangerousHtml={false}
                      rawSourcePos={true}
                      renderers={MarkdownRenderer({
                        currentRepositoryURL,
                        value: notes,
                        onChange: setNotes,
                        isEditing
                      })}
                    >
                      {notes}
                    </ReactMarkdown>
                  </Flex>
                </Flex>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
      <Stack
        position="fixed"
        top={140}
        right={12}
        direction="row"
        borderRadius="lg"
        background={colorMode === 'dark' ? 'gray.800' : 'white'}
        p={4}
      >
        {isEditing ? (
          <Stack direction="row" flexGrow={1} spacing={4}>
            <Button
              colorScheme="green"
              leftIcon={<CheckCircleIcon />}
              onClick={saveEditing}
              size="sm"
            >
              Save
            </Button>
            <Button
              colorScheme="gray"
              leftIcon={<SmallCloseIcon />}
              onClick={cancelEditing}
              size="sm"
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" flexGrow={1} spacing={4}>
            <Tooltip hasArrow label="Delete" bg="red.600" color="white">
              <IconButton
                aria-label="Delete"
                size="sm"
                variant="ghost"
                color={colorMode === 'dark' ? 'white' : 'gray.500'}
                icon={<FaTrash />}
                onClick={onDelete}
              />
            </Tooltip>
            <Tooltip hasArrow label="Add a tag" bg="blue.600" color="white">
              <IconButton
                aria-label="Add a tag"
                size="sm"
                variant="ghost"
                color={colorMode === 'dark' ? 'white' : 'gray.500'}
                icon={<FaTag />}
                onClick={onOpenAddTagModal}
              />
            </Tooltip>
            <Button
              colorScheme="blue"
              leftIcon={<EditIcon />}
              onClick={() => {
                toggleEditing();
              }}
              size="sm"
            >
              Edit
            </Button>
          </Stack>
        )}
      </Stack>
    </>
  );
}

export default DocumentView;
