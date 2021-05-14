import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Flex,
  Stack,
  Button,
  Box,
  IconButton,
  useColorMode,
  Kbd,
  Collapse,
  Tooltip
} from '@chakra-ui/react';
import { store as specificationStore } from '../../context/SpecificationContext';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import useTree from '../../hooks/useTree';
import ChangeTreeNodeModal from '../modal/ChangeTreeNodeModal';
import useAppState from '../../hooks/useAppState';
import { store as appStateStore } from '../../context/AppStateContext';
import Tree from '../tree/Tree';
import AddTagModal from '../modal/AddTagModal';
import {
  FaChalkboardTeacher,
  FaCompress,
  FaDraftingCompass,
  FaExpand,
  FaFolder,
  FaHandPointRight,
  FaLightbulb,
  FaQuestion,
  FaQuestionCircle,
  FaStar,
  FaTimes
} from 'react-icons/fa';
import nodeClickedAction from '../../actions/nodeClickedAction';

function ResponsiveTreeView() {
  const specTreeContainerRef = useRef<HTMLDivElement | null>(null);
  const mapTreeContainerRef = useRef<HTMLDivElement | null>(null);

  const appStateContext = useContext(appStateStore);
  const specificationContext = useContext(specificationStore);
  const exampleMapContext = useContext(exampleMapStore);

  const { isAddTagModalOpen, onOpenAddTagModal } = useAppState();

  const [isSpecTreeFocused, setIsSpecTreeFocused] = useState(false);
  const [isMapTreeFocused, setIsMapTreeFocused] = useState(false);

  const { colorMode } = useColorMode();

  const {
    currentSpecNode,
    currentMapNode,
    currentMapState,
    isTreeNodeModalOpen,
    onToggleExpandTreeView,
    isTreeViewExpanded,
    isSpecTreeVisible,
    isMapTreeVisible,
    onToggleSpecTreeVisibility,
    onToggleMapTreeVisibility,
    onOpenDeleteSpecNodeModal,
    onOpenDeleteMapNodeModal,
    createFolder,
    createFeature,
    createExampleMap
  } = useTree();

  const focusCurrentTree = () => {
    if (currentSpecNode?.type !== 'map' && specTreeContainerRef?.current) {
      specTreeContainerRef.current.focus();
    }
    if (currentSpecNode?.type === 'map' && mapTreeContainerRef?.current) {
      mapTreeContainerRef.current.focus();
    }
  };

  const newFolder = () => {
    createFolder();
  };

  const newFeature = () => {
    createFeature();
  };

  const newExampleMap = () => {
    createExampleMap();
  };

  /* Example Map Tree */
  const { createStory, createRule, createExample, createQuestion } = useTree();

  const newStory = () => {
    createStory();
  };

  const newRule = () => {
    createRule();
  };

  const newExample = () => {
    createExample();
  };

  const newQuestion = () => {
    createQuestion();
  };

  const keydownSpecHandler = useCallback(
    (evt: React.KeyboardEvent<HTMLDivElement> | any) => {
      if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) {
        return;
      }
      switch (evt.keyCode) {
        case 84: // t
          evt.preventDefault();
          onOpenAddTagModal();
          break;
        case 77: // m
          evt.preventDefault();
          createExampleMap();
          break;
        case 70: // f
          evt.preventDefault();
          createFeature();
          break;
        case 13: // enter
          evt.preventDefault();
          createFolder();
          break;
        case 46: // del
          evt.preventDefault();
          onOpenDeleteSpecNodeModal();
          break;
      }
    },
    []
  );

  const keydownMapHandler = useCallback(
    (evt: React.KeyboardEvent<HTMLDivElement> | any) => {
      if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) {
        return;
      }
      switch (evt.keyCode) {
        case 84: // t
          evt.preventDefault();
          onOpenAddTagModal();
          break;
        case 46: // del
          evt.preventDefault();
          onOpenDeleteMapNodeModal();
          break;
        case 83: // s
          evt.preventDefault();
          createStory();
          break;
        case 82: // r
          evt.preventDefault();
          createRule();
          break;
        case 69: // e
          evt.preventDefault();
          createExample();
          break;
        case 81: // q
          evt.preventDefault();
          createQuestion();
          break;
      }
    },
    []
  );

  const toggleExpandTreeView = () => {
    onToggleExpandTreeView();
  };

  const showExampleMappingTutorial = () => {
    appStateContext.dispatch({
      type: 'CHANGE_HELP_DRAWER',
      payload: { isOpen: true, view: 'example-mapping-tutorial' }
    });
  };

  const toggleMapTreeVisibility = () => {
    onToggleMapTreeVisibility();
  };

  const toggleSpecTreeVisibility = () => {
    onToggleSpecTreeVisibility();
  };

  const toggleExpandExampleMap = () => {
    onToggleExpandTreeView();
    onToggleSpecTreeVisibility();
  };

  const onFocusTree = (evt: React.FocusEvent<HTMLDivElement>, tree: string) => {
    if (tree === 'spec') {
      setIsSpecTreeFocused(true);
    } else {
      setIsMapTreeFocused(true);
    }
  };

  const onBlurTree = (evt: React.FocusEvent<HTMLDivElement>, tree: string) => {
    if (tree === 'spec') {
      setIsSpecTreeFocused(false);
    } else {
      setIsMapTreeFocused(false);
    }
  };

  useEffect(() => {
    if (!currentMapNode && currentMapState && currentMapState.tree[0]) {
      exampleMapContext.dispatch(
        nodeClickedAction({ node: currentMapState.tree[0], treeIndex: 0 })
      );
    }
  }, [currentMapNode, currentMapState, exampleMapContext]);

  useEffect(() => {
    const specTreeContainerRefCopy = specTreeContainerRef?.current;
    const mapTreeContainerRefCopy = mapTreeContainerRef?.current;

    if (specTreeContainerRefCopy) {
      specTreeContainerRefCopy.addEventListener(
        'keydown',
        keydownSpecHandler,
        false
      );
    }
    if (mapTreeContainerRefCopy) {
      mapTreeContainerRefCopy.addEventListener(
        'keydown',
        keydownMapHandler,
        false
      );
    }

    return () => {
      if (specTreeContainerRefCopy) {
        specTreeContainerRefCopy.removeEventListener(
          'keydown',
          keydownSpecHandler,
          false
        );
      }
      if (mapTreeContainerRefCopy) {
        mapTreeContainerRefCopy.removeEventListener(
          'keydown',
          keydownMapHandler,
          false
        );
      }
    };
  }, [specTreeContainerRef?.current, mapTreeContainerRef?.current]);

  useEffect(() => {
    if (!isTreeNodeModalOpen || !isAddTagModalOpen) {
      focusCurrentTree();
    }
  }, [isTreeNodeModalOpen, isAddTagModalOpen]);

  return (
    <>
      <Flex
        direction={isTreeViewExpanded ? 'row' : 'column'}
        flexGrow={1}
        pt={10}
        pb={8}
        pl={8}
        pr={isTreeViewExpanded ? 8 : 0}
      >
        {!isSpecTreeVisible ? (
          <Stack
            direction="column"
            {...(!isTreeViewExpanded
              ? { width: '100%', pl: 4, pt: 2, pb: 2 }
              : { width: 10, pl: 2, pr: 2, pt: 4 })}
            borderWidth="1px"
            borderRadius="md"
            fontSize="xs"
            fontWeight="bold"
            onClick={toggleSpecTreeVisibility}
            cursor="pointer"
          >
            <Box
              fontSize="sm"
              color="gray.300"
              css={isTreeViewExpanded && { writingMode: 'vertical-lr' }}
            >
              Living Specification
            </Box>
          </Stack>
        ) : (
          <Flex direction="column" flexGrow={isSpecTreeVisible ? 1 : 0}>
            <Flex
              ref={specTreeContainerRef}
              direction="column"
              borderLeftWidth="1px"
              borderRightWidth="1px"
              borderTopWidth="1px"
              borderTopRadius="md"
              flexGrow={1}
              tabIndex={-1}
              _focus={{
                outline: 'none'
              }}
              onFocus={(evt: React.FocusEvent<HTMLDivElement>) =>
                onFocusTree(evt, 'spec')
              }
              onBlur={(evt: React.FocusEvent<HTMLDivElement>) =>
                onBlurTree(evt, 'spec')
              }
            >
              <Flex
                direction="row"
                alignItems="center"
                w="100%"
                pl={2}
                pr={2}
                fontSize="xs"
                fontWeight="bold"
                overflowX="hidden"
              >
                <Box
                  flexGrow={1}
                  pt={2}
                  pb={2}
                  ml={2}
                  fontSize="sm"
                  color="gray.300"
                >
                  Living Specification
                </Box>
                {isTreeViewExpanded ? (
                  <Tooltip
                    hasArrow
                    label="Collapse Tree View"
                    bg="blue.600"
                    color="white"
                  >
                    <IconButton
                      aria-label="Collapse Tree View"
                      size="xs"
                      variant="outline"
                      color="gray.300"
                      icon={<FaCompress />}
                      onClick={toggleExpandTreeView}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip
                    hasArrow
                    label="Expand Tree View"
                    bg="blue.600"
                    color="white"
                  >
                    <IconButton
                      aria-label="Expand Tree View"
                      size="xs"
                      variant="outline"
                      color="gray.300"
                      icon={<FaExpand />}
                      onClick={toggleExpandTreeView}
                    />
                  </Tooltip>
                )}
                <Tooltip
                  hasArrow
                  label="Hide Specification Tree"
                  bg="blue.600"
                  color="white"
                >
                  <IconButton
                    aria-label="Hide Specification Tree"
                    ml={2}
                    size="xs"
                    variant="outline"
                    color="gray.300"
                    icon={<FaTimes />}
                    onClick={toggleSpecTreeVisibility}
                  />
                </Tooltip>
              </Flex>
              {isSpecTreeVisible && (
                <Tree
                  state={specificationContext.state}
                  dispatch={specificationContext.dispatch}
                  type="spec"
                  height={32}
                />
              )}
            </Flex>
            {isSpecTreeVisible && (
              <>
                <Box
                  borderLeftWidth="1px"
                  borderRightWidth="1px"
                  borderBottomWidth="1px"
                  color="gray.500"
                  w="100%"
                  pl={2}
                  pt={2}
                  pb={2}
                  boxShadow={
                    colorMode === 'dark' ? '' : 'inset 0 0 10px #eeeeee'
                  }
                  overflowX="hidden"
                >
                  <Collapse in={isSpecTreeFocused}>
                    <Stack isInline pb={2} spacing={2}>
                      <Box fontSize="xs">
                        Folder <Kbd>Enter</Kbd>
                      </Box>
                      <Box fontSize="xs">
                        Feature <Kbd>F</Kbd>
                      </Box>
                      <Box fontSize="xs">
                        Map <Kbd>M</Kbd>
                      </Box>
                      <Box fontSize="xs">
                        Delete <Kbd>Del</Kbd>
                      </Box>
                      <Box fontSize="xs">
                        Tag <Kbd>T</Kbd>
                      </Box>
                    </Stack>
                  </Collapse>
                  <Stack direction="row" fontSize="xs" fontWeight="bold">
                    <Button
                      colorScheme="gray"
                      size="xs"
                      variant="outline"
                      onClick={newFolder}
                    >
                      <Box pr={2}>
                        <FaFolder />
                      </Box>
                      Folder
                    </Button>
                    <Button
                      colorScheme="purple"
                      size="xs"
                      variant="outline"
                      onClick={newFeature}
                    >
                      <Box pr={2}>
                        <FaStar />
                      </Box>
                      Feature
                    </Button>
                    <Button
                      colorScheme="green"
                      size="xs"
                      variant="outline"
                      onClick={newExampleMap}
                    >
                      <Box pr={2}>
                        <FaDraftingCompass />
                      </Box>
                      Example Map
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </Flex>
        )}
        {currentMapState && currentSpecNode?.type === 'map' && (
          <>
            <Box p={2} />
            {!isMapTreeVisible ? (
              <Stack
                direction="column"
                {...(!isTreeViewExpanded
                  ? { width: '100%', pl: 4, pt: 2, pb: 2 }
                  : { width: 10, pl: 2, pr: 2, pt: 4 })}
                borderWidth="1px"
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
                onClick={toggleMapTreeVisibility}
                cursor="pointer"
              >
                <Box
                  fontSize="sm"
                  color="gray.300"
                  css={isTreeViewExpanded && { writingMode: 'vertical-lr' }}
                >
                  Example Map
                </Box>
              </Stack>
            ) : (
              <Flex direction="column" flexGrow={isMapTreeVisible ? 1 : 0}>
                <Flex
                  ref={mapTreeContainerRef}
                  direction="column"
                  borderLeftWidth="1px"
                  borderRightWidth="1px"
                  borderTopWidth="1px"
                  borderTopRadius="md"
                  flexGrow={1}
                  tabIndex={-1}
                  _focus={{
                    outline: 'none !important'
                  }}
                  onFocus={(evt: React.FocusEvent<HTMLDivElement>) =>
                    onFocusTree(evt, 'map')
                  }
                  onBlur={(evt: React.FocusEvent<HTMLDivElement>) =>
                    onBlurTree(evt, 'map')
                  }
                >
                  <Flex
                    direction="row"
                    alignItems="center"
                    w="100%"
                    pl={2}
                    pr={2}
                    fontSize="xs"
                    fontWeight="bold"
                    overflowX="hidden"
                  >
                    <Box
                      flexGrow={1}
                      pt={2}
                      pb={2}
                      ml={2}
                      fontSize="sm"
                      color="gray.300"
                    >
                      Example Map
                    </Box>
                    <Tooltip
                      hasArrow
                      label="Example Mapping Tutorial"
                      bg="green.600"
                      color="white"
                    >
                      <IconButton
                        aria-label="Example Mapping Tutorial"
                        size="xs"
                        variant="outline"
                        color="gray.300"
                        icon={<FaQuestion />}
                        mr={2}
                        onClick={showExampleMappingTutorial}
                      />
                    </Tooltip>
                    {!isTreeViewExpanded ? (
                      <Tooltip
                        hasArrow
                        label="Expand Example Map"
                        bg="blue.600"
                        color="white"
                      >
                        <IconButton
                          aria-label="Expand Example Map"
                          size="xs"
                          variant="outline"
                          color="gray.300"
                          icon={<FaExpand />}
                          mr={2}
                          onClick={toggleExpandExampleMap}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip
                        hasArrow
                        label="Collapse Tree View"
                        bg="blue.600"
                        color="white"
                      >
                        <IconButton
                          aria-label="Collapse Tree View"
                          size="xs"
                          variant="outline"
                          color="gray.300"
                          icon={<FaCompress />}
                          mr={2}
                          onClick={toggleExpandTreeView}
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      hasArrow
                      label="Hide Example Map"
                      bg="blue.600"
                      color="white"
                    >
                      <IconButton
                        aria-label="Hide Example Map"
                        size="xs"
                        variant="outline"
                        color="gray.300"
                        icon={<FaTimes />}
                        onClick={toggleMapTreeVisibility}
                      />
                    </Tooltip>
                  </Flex>
                  {isMapTreeVisible && (
                    <Tree
                      state={currentMapState}
                      dispatch={exampleMapContext.dispatch}
                      type="map"
                      height={32}
                    />
                  )}
                </Flex>
                {isMapTreeVisible && (
                  <Box
                    borderLeftWidth="1px"
                    borderRightWidth="1px"
                    borderBottomWidth="1px"
                    color="gray.500"
                    w="100%"
                    pl={2}
                    pt={2}
                    pb={2}
                    boxShadow={
                      colorMode === 'dark' ? '' : 'inset 0 0 10px #eeeeee'
                    }
                    overflowX="hidden"
                  >
                    <Collapse in={isMapTreeFocused}>
                      <Stack isInline pb={2} spacing={2}>
                        <Box fontSize="xs">
                          Story <Kbd>S</Kbd>
                        </Box>
                        <Box fontSize="xs">
                          Rule <Kbd>R</Kbd>
                        </Box>
                        <Box fontSize="xs">
                          Example <Kbd>E</Kbd>
                        </Box>
                        <Box fontSize="xs">
                          Question <Kbd>Q</Kbd>
                        </Box>
                        <Box fontSize="xs">
                          Delete <Kbd>Del</Kbd>
                        </Box>
                      </Stack>
                    </Collapse>
                    <Stack direction="row" fontSize="xs" fontWeight="bold">
                      <Button
                        colorScheme="yellow"
                        size="xs"
                        variant="outline"
                        onClick={newStory}
                      >
                        <Box pr={2}>
                          <FaChalkboardTeacher />
                        </Box>
                        Story
                      </Button>
                      <Button
                        colorScheme="blue"
                        size="xs"
                        variant="outline"
                        onClick={newRule}
                      >
                        <Box pr={2}>
                          <FaHandPointRight />
                        </Box>
                        Rule
                      </Button>
                      <Button
                        colorScheme="green"
                        size="xs"
                        variant="outline"
                        onClick={newExample}
                      >
                        <Box pr={2}>
                          <FaLightbulb />
                        </Box>
                        Example
                      </Button>
                      <Button
                        colorScheme="red"
                        size="xs"
                        variant="outline"
                        onClick={newQuestion}
                      >
                        <Box pr={2}>
                          <FaQuestionCircle />
                        </Box>
                        Question
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Flex>
            )}
          </>
        )}
      </Flex>
      {isTreeNodeModalOpen && <ChangeTreeNodeModal />}
      {isAddTagModalOpen && <AddTagModal />}
    </>
  );
}

export default ResponsiveTreeView;
