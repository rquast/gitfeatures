import React, { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Stack,
  useDisclosure
} from '@chakra-ui/react';
import Sketch from '../sketch/Sketch';
import {
  FaRedo,
  FaRegWindowMaximize,
  FaUndo,
  FaWindowClose
} from 'react-icons/fa';
import type { SketchElementProps } from '../../types';

const SketchElement = (props: SketchElementProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canvasRef = useRef<any | null>(null);

  useEffect(() => {
    if (isOpen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  }, [isOpen]);

  const onExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onClose();
  };

  const onUndo = () => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.undo();
  };

  const onRedo = () => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.redo();
  };

  const canvas = useMemo(
    () => <Sketch ref={canvasRef} sketchElementProps={props} />,
    [props.markdown, props.isEditing]
  );

  return (
    <>
      {!isOpen ? (
        <Stack direction="column" mb={8}>
          <Box
            borderWidth={props.isEditing ? '1px' : ''}
            borderRadius={props.isEditing ? 'lg' : ''}
            width={props.width + 'px'}
            height={props.height + 'px'}
          >
            {canvas}
          </Box>
          {props.isEditing && (
            <Stack direction="row">
              <Button onClick={onOpen} leftIcon={<FaRegWindowMaximize />}>
                Fullscreen
              </Button>
              <Button onClick={onUndo} leftIcon={<FaUndo />}>
                Undo
              </Button>
              <Button onClick={onRedo} leftIcon={<FaRedo />}>
                Redo
              </Button>
            </Stack>
          )}
        </Stack>
      ) : (
        <Drawer onClose={onClose} isOpen={isOpen} size="full">
          <DrawerOverlay>
            <DrawerContent>
              <DrawerBody
                display="flex"
                flexDirection="row"
                flexGrow={1}
                alignItems="center"
              >
                <Center flexGrow={1}>
                  <Stack direction="column">
                    <Box borderWidth="1px" borderRadius="lg">
                      {canvas}
                    </Box>
                    <Stack direction="row">
                      <Button
                        onClick={onExitFullscreen}
                        leftIcon={<FaWindowClose />}
                      >
                        Exit Fullscreen
                      </Button>
                      <Button onClick={onUndo} leftIcon={<FaUndo />}>
                        Undo
                      </Button>
                      <Button onClick={onRedo} leftIcon={<FaRedo />}>
                        Redo
                      </Button>
                    </Stack>
                  </Stack>
                </Center>
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
    </>
  );
};

export default SketchElement;
