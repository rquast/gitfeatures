import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-gherkin';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-okaidia.css';
import { Box, Flex, IconButton, Stack, useColorMode } from '@chakra-ui/react';
import Editor from 'react-simple-code-editor';
import useAppState from '../../hooks/useAppState';
import { nanoid } from 'nanoid';
import { AttachmentIcon } from '@chakra-ui/icons';
import { FaPencilAlt, FaProjectDiagram, FaRegSmile } from 'react-icons/fa';
import './code-editor.css';

const CodeEditor = (props: any) => {
  const editorRef: any = useRef<React.Component | null>(null);
  const previewRef: any = useRef<HTMLPreElement | null>(null);
  const eventKeyRef: any = useRef<string>('');

  const { colorMode } = useColorMode();

  const [clickOffset, setClickOffset]: [any, any] = useState(0);
  const language = props.language || 'gherkin';
  const {
    onOpenEmoticonPickerModal,
    onOpenMermaidModal,
    insertValueEvent,
    onOpenFilesModal
  } = useAppState();

  const handleEmoticonClick = () => {
    eventKeyRef.current = nanoid();
    onOpenEmoticonPickerModal(eventKeyRef.current);
  };

  const handleFilesClick = () => {
    eventKeyRef.current = nanoid();
    onOpenFilesModal(eventKeyRef.current);
  };

  const handleSketchClick = () => {
    insertValueIntoEditor('\n```sketch[400x400]\n```\n');
  };

  const handleMermaidClick = () => {
    eventKeyRef.current = nanoid();
    onOpenMermaidModal(eventKeyRef.current);
  };

  useEffect(() => {
    if (insertValueEvent.eventKey === eventKeyRef.current) {
      insertValueIntoEditor(insertValueEvent.value);
      eventKeyRef.current = nanoid();
    }
  }, [insertValueEvent]);

  const insertValueIntoEditor = (str: string) => {
    editorRef?.current?._applyEdits({
      value:
        props.content.substring(0, clickOffset) +
        str +
        props.content.substring(clickOffset),
      selectionStart: clickOffset,
      selectionEnd: clickOffset
    });
  };

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = Prism.highlight(
        props.content,
        Prism.languages[language],
        language
      );
    }
  }, [props.content, props.isEditing]);

  return (
    <>
      {typeof props.isEditing === 'undefined' || props.isEditing ? (
        <Flex direction="column" flexGrow={1}>
          <Flex direction="row" flexGrow={1}>
            <Box
              background="rgb(1, 22, 39)"
              borderRadius="md"
              padding={2}
              {...props.styleProps}
              overflowY="auto"
              flexGrow={1}
            >
              <Editor
                ref={editorRef}
                preClassName={`editor-pre language-${language}`}
                textareaClassName={`editor-textarea language-${language}`}
                value={props.content}
                onValueChange={props.onContentChange}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages[language], language)
                }
                padding={10}
                style={{
                  fontFamily: 'Cascadia Mono',
                  fontSize: '1rem',
                  caretColor: 'white',
                  height: '100%'
                }}
                onClick={(
                  evt:
                    | React.MouseEvent<HTMLDivElement>
                    | React.MouseEvent<HTMLTextAreaElement>
                    | any
                ) => setClickOffset(evt.target?.selectionStart)}
                onKeyDown={(
                  evt:
                    | React.KeyboardEvent<HTMLDivElement>
                    | React.KeyboardEvent<HTMLTextAreaElement>
                    | any
                ) => setClickOffset(evt.target?.selectionStart + 1)}
              />
            </Box>
            <Stack flexDirection="column" ml={2}>
              <Stack position="sticky" top="240" alignSelf="flex-start">
                {language !== 'javascript' && (
                  <>
                    <IconButton
                      aria-label="Emoticons"
                      size="md"
                      fontSize="lg"
                      icon={<FaRegSmile />}
                      onClick={handleEmoticonClick}
                    />
                  </>
                )}
                {language !== 'javascript' && language !== 'gherkin' && (
                  <>
                    <IconButton
                      size="md"
                      fontSize="lg"
                      aria-label="Attach Files"
                      icon={<AttachmentIcon />}
                      onClick={handleFilesClick}
                    />
                    <IconButton
                      size="md"
                      fontSize="lg"
                      aria-label="Diagram"
                      icon={<FaProjectDiagram />}
                      onClick={handleMermaidClick}
                    />
                    <IconButton
                      size="md"
                      fontSize="lg"
                      aria-label="Sketch"
                      icon={<FaPencilAlt />}
                      onClick={handleSketchClick}
                    />
                  </>
                )}
              </Stack>
            </Stack>
          </Flex>
        </Flex>
      ) : (
        <>
          {props.content?.trim().length > 0 && (
            <Box
              background={colorMode !== 'dark' ? 'rgb(1, 22, 39)' : ''}
              borderRadius="lg"
              p={4}
              borderWidth={colorMode === 'dark' ? '1px' : ''}
            >
              <pre
                ref={previewRef}
                className="editor-pre"
                style={{
                  fontFamily: 'Cascadia Mono',
                  fontSize: '1rem',
                  color: 'white',
                  whiteSpace: 'pre-wrap'
                }}
              />
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default CodeEditor;
