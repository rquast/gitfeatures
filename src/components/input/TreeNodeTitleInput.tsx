import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Box,
  Flex,
  Button,
  Input,
  FormErrorMessage,
  FormControl,
  Stack
} from '@chakra-ui/react';
import useTree from '../../hooks/useTree';
import { EditIcon } from '@chakra-ui/icons';
import useAppState from '../../hooks/useAppState';
import { nanoid } from 'nanoid';
import { isValidSlug, parseTitleForSlug } from '../../utils/SlugUtils';
import { store as exampleMapStore } from '../../context/ExampleMapContext';
import touchedAction from '../../actions/touchedAction';
import setValueAction from '../../actions/setValueAction';
import renameTreeKeyAction from '../../actions/renameTreeKeyAction';
import renameKeyAction from '../../actions/renameKeyAction';
import changeSelectedTreeAction from '../../actions/changeSelectedTreeAction';
import useUndoable from '../../hooks/useUndoable';
import type { ContextActions } from '../../types';

function TreeNodeTitleInput({
  type,
  isDecorated
}: {
  type: string;
  isDecorated?: boolean;
}) {
  const exampleMapContext = useContext(exampleMapStore);

  const titleRef: any = useRef<HTMLInputElement | null>(null);
  const emojiButtonRef: any = useRef<HTMLButtonElement | null>(null);
  const eventKeyRef = useRef<string>('');

  const { currentSpecState, currentSpecNode, currentMapNode } = useTree();
  const { undoable } = useUndoable();

  let currentNode: any;
  if (type === 'map') {
    currentNode = currentMapNode;
  } else {
    currentNode = currentSpecNode;
  }

  const [title, setTitle] = useState('');
  const [showButton, setShowButton] = useState(false);
  const { insertValueEvent, onOpenEmoticonPickerModal } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const saveTitle = async (parsedTitle: any) => {
    let contextActions: ContextActions[] = [];

    // update both key and title if slug changes
    if (parsedTitle.slug && currentNode.key !== parsedTitle.slug) {
      if (
        !['story', 'example', 'question', 'rule'].includes(currentNode.type)
      ) {
        if (currentNode.type === 'map') {
          contextActions.push({
            type: 'map',
            action: renameTreeKeyAction(currentNode.key, parsedTitle.slug)
          });
          contextActions.push({ type: 'map', action: touchedAction() });
        }

        contextActions.push({
          type,
          action: renameKeyAction(
            currentNode.key,
            parsedTitle.slug,
            parsedTitle.title
          )
        });
        contextActions.push({ type, action: touchedAction() });

        if (currentNode.type === 'map') {
          contextActions.push({
            type: 'map',
            action: changeSelectedTreeAction(parsedTitle.slug)
          });
        }
      }

      // only update title if key doesn't change
    } else if (currentNode.title !== parsedTitle.title) {
      contextActions.push({
        type,
        action: setValueAction(currentNode, 'title', parsedTitle.title)
      });
      contextActions.push({ type, action: touchedAction() });
    }

    // execute undoable dispatch
    if (contextActions.length > 0) {
      undoable(contextActions);
    }

    if (parsedTitle.title) {
      setTitle(parsedTitle.title);
    }
  };

  const revertTitle = () => {
    setTitle(`${currentNode.title || ''}`);
  };

  useEffect(() => {
    if (currentNode) {
      setTitle(`${currentNode.title || ''}`);
    }
  }, [currentNode]);

  useEffect(() => {
    const inputEl = titleRef?.current;
    if (inputEl) {
      inputEl.addEventListener('keydown', keydownHandler, false);
    }
    return () => {
      if (inputEl) {
        inputEl.removeEventListener('keydown', keydownHandler, false);
      }
    };
  }, [titleRef?.current]);

  useEffect(() => {
    if (titleRef.current && insertValueEvent.eventKey === eventKeyRef.current) {
      insertValue(insertValueEvent.value);
      eventKeyRef.current = nanoid();
    }
  }, [insertValueEvent]);

  const keydownHandler = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>) => {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        onSubmit();
      } else if (evt.keyCode === 27) {
        evt.preventDefault();
        revertTitle();
        setIsEditing(false);
      }
    },
    [currentNode]
  );

  const onSubmit = () => {
    try {
      if (
        !['story', 'example', 'question', 'rule'].includes(currentNode.type)
      ) {
        const parsedTitle = parseTitleForSlug(
          titleRef.current.value + '',
          currentSpecState.tree
        );
        if (parsedTitle?.slug && exampleMapContext.state.trees) {
          for (const key of Object.keys(exampleMapContext.state.trees)) {
            isValidSlug(
              parsedTitle.slug,
              exampleMapContext.state.trees[key].tree
            );
          }
        }
        saveTitle(parsedTitle);
      } else {
        saveTitle({ title: titleRef.current.value + '' });
      }
      setIsInvalid(false);
      setIsEditing(false);
    } catch (err: any) {
      setIsInvalid(true);
      setError(err.message);
    }
  };

  const onChangeTitle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setTitle(evt.target.value + '');
  };

  const onInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    evt.preventDefault();
    if (
      evt.currentTarget !== titleRef.current ||
      evt.relatedTarget !== emojiButtonRef.current
    ) {
      onSubmit();
    }
  };

  const onClickEmoticonButton = () => {
    eventKeyRef.current = nanoid();
    onOpenEmoticonPickerModal(eventKeyRef.current);
  };

  const onEdit = () => {
    setShowButton(false);
    setIsEditing(true);
    if (!['story', 'example', 'question', 'rule'].includes(currentNode.type)) {
      setTitle(`${title} #${currentNode.key}`);
    }
    setTimeout(() => {
      titleRef.current.focus();
    }, 0);
  };

  const insertValue = (value: string) => {
    const index = titleRef.current.selectionStart;
    if (index >= 0) {
      titleRef.current.value =
        titleRef.current.value.slice(0, index) +
        value +
        titleRef.current.value.slice(index);
    } else {
      titleRef.current.value += value;
    }
    setTitle(titleRef.current.value);
    // TODO: this is a nasty bit of code to retain focus - needs refactoring
    setTimeout(() => {
      titleRef.current.focus();
      setIsEditing(true);
    }, 200);
  };

  const getNodeColor: any = () => {
    switch (currentNode?.type) {
      case 'story':
        return 'yellow.200';
      case 'rule':
        return 'blue.200';
      case 'example':
        return 'green.200';
      case 'question':
        return 'red.200';
    }
    return;
  };

  const getNodeDarkColor: any = () => {
    switch (currentNode?.type) {
      case 'story':
        return 'yellow.500';
      case 'rule':
        return 'blue.500';
      case 'example':
        return 'green.500';
      case 'question':
        return 'red.500';
    }
    return;
  };

  const getInputSizeArgs: any = () => {
    if (type === 'map') {
      return {
        color: 'gray.900',
        fontSize: 'lg',
        fontWeight: 'bold',
        borderLeftRadius: 0,
        bg: getNodeColor()
      };
    } else {
      return {
        borderRadius: 'lg',
        size: 'lg',
        fontSize: '3xl',
        fontWeight: 'bold'
      };
    }
  };

  const getRenderSizeArgs: any = () => {
    if (type === 'map') {
      return {
        pl: 4,
        pr: 4,
        borderRightRadius: 8
      };
    }
  };

  return (
    <Flex flexDirection="column" width="100%">
      <Flex
        flexDirection="row"
        alignItems="center"
        maxWidth="1200px"
        flexGrow={1}
      >
        {isDecorated && (
          <Flex
            direction="column"
            borderLeftRadius={8}
            justifyContent="center"
            bg={getNodeDarkColor}
            pl={4}
            pr={4}
            verticalAlign="center"
            minHeight={10}
          >
            <Box
              color={getNodeColor}
              fontSize="sm"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {currentNode?.type}
            </Box>
          </Flex>
        )}

        {isEditing && (
          <FormControl isInvalid={isInvalid}>
            <Stack>
              <Flex>
                <Input
                  ref={titleRef}
                  placeholder="Add Title ..."
                  {...getInputSizeArgs()}
                  flexGrow={1}
                  value={title}
                  onChange={onChangeTitle}
                  onBlur={onInputBlur}
                />
                <Button
                  ref={emojiButtonRef}
                  ml={4}
                  fontSize="xl"
                  onClick={onClickEmoticonButton}
                >
                  😀
                </Button>
              </Flex>
              <FormErrorMessage>{error}</FormErrorMessage>
            </Stack>
          </FormControl>
        )}

        {!isEditing && (
          <Flex
            alignItems="center"
            minHeight={10}
            {...getInputSizeArgs()}
            {...getRenderSizeArgs()}
            bg={getNodeColor}
            onFocus={onEdit}
            onClick={onEdit}
            onMouseOver={() => setShowButton(true)}
            onMouseOut={() => setShowButton(false)}
          >
            {title}
          </Flex>
        )}

        {!isEditing && showButton && (
          <Box
            as="button"
            borderRadius="md"
            fontSize="14px"
            fontWeight="semibold"
            color="gray.500"
            ml={4}
            _hover={{ bg: '#ebedf0' }}
          >
            <EditIcon fontSize="xl" />
          </Box>
        )}
      </Flex>
    </Flex>
  );
}

export default TreeNodeTitleInput;
