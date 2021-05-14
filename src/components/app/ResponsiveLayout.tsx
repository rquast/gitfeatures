import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext
} from 'react';
import {
  Box,
  Divider,
  Flex,
  Text,
  Skeleton,
  Stack,
  useColorMode
} from '@chakra-ui/react';
import useTree from '../../hooks/useTree';
import { FaHandPointRight } from 'react-icons/fa';
import ResponsiveTreeView from '../view/ResponsiveTreeView';
import ResponsiveContent from './ResponsiveContent';
import ResponsiveHeader from './ResponsiveHeader';
import { createAppStatePatch } from '../../utils/PatchUtils';
import { store as appStateStore } from '../../context/AppStateContext';
import { initialAppState } from '../../context/initialAppState';

function ResponsiveLayout() {
  const appStateContext = useContext(appStateStore);
  const containerRef: any = useRef<HTMLDivElement | null>(null);
  const firstStyleSheet: any = useRef<CSSStyleSheet | null>(null);

  const [divider, setDivider] = useState<number>(440);
  const [collapseTreeView, setCollapseTreeView] = useState<boolean>(false);

  const { colorMode } = useColorMode();

  const { isSpecificationReady, isTreeViewExpanded } = useTree();

  const isDragging = useRef<boolean>(false);

  const getInitialDivider = () => {
    const lastDivider = Number(sessionStorage.getItem('divider'));
    if (sessionStorage.getItem('divider') !== null && lastDivider < 400) {
      setCollapseTreeView(true);
    }
    const containerWidth = containerRef.current.offsetWidth;
    if (lastDivider > 0 && lastDivider < containerWidth * 0.8) {
      return lastDivider;
    }
    const twentyPercentWidth = containerWidth * 0.3;
    if (twentyPercentWidth > 1000) {
      return 1000;
    } else if (twentyPercentWidth <= 440) {
      return 440;
    } else {
      return twentyPercentWidth;
    }
  };

  // Cross-browser adjust scrollbar colors
  useEffect(() => {
    if (!firstStyleSheet.current) {
      firstStyleSheet.current = document.styleSheets[0];
    }

    if ('insertRule' in firstStyleSheet.current) {
      let i = 0;
      const rulesToDelete = [];
      for (const rule of firstStyleSheet.current.cssRules) {
        if (
          rule.cssText.startsWith('::-webkit-scrollbar') ||
          rule.cssText.startsWith('html, body { scrollbar-color')
        ) {
          rulesToDelete.push(i);
        } else {
          i++;
        }
      }
      rulesToDelete.reverse();
      for (const i of rulesToDelete) {
        firstStyleSheet.current.deleteRule(i);
      }
      firstStyleSheet.current.insertRule(
        '::-webkit-scrollbar { background: ' +
          (colorMode !== 'dark' ? '#F7FAFC' : '#2D3748') +
          ' !important; }',
        0
      );
      firstStyleSheet.current.insertRule(
        '::-webkit-scrollbar-thumb { background: ' +
          (colorMode !== 'dark' ? '#EDF2F7' : '#4A5568') +
          ' !important; }',
        0
      );
      firstStyleSheet.current.insertRule(
        'html, body { scrollbar-color: ' +
          (colorMode !== 'dark' ? '#EDF2F7 #F7FAFC' : '#4A5568 #2D3748') +
          ' !important; }',
        0
      );
    }
  }, [colorMode]);

  useEffect(() => {
    setDivider(getInitialDivider);
  }, [containerRef.current]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('touchend', onTouchEnd, false);
    window.addEventListener('touchmove', onTouchMove, false);
    return () => {
      window.removeEventListener('keydown', onKeyDown, false);
      window.removeEventListener('mouseup', onMouseUp, false);
      window.removeEventListener('mousemove', onMouseMove, false);
      window.removeEventListener('touchend', onTouchEnd, false);
      window.removeEventListener('touchmove', onTouchMove, false);
    };
  }, []);

  const onMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'w-resize';
  }, []);

  const onTouchStart = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'w-resize';
  }, []);

  const onMouseMove = useCallback(
    (evt: React.MouseEvent<HTMLDivElement> | any) => {
      if (isDragging.current && evt.buttons !== 1) {
        isDragging.current = false;
        document.body.style.cursor = 'auto';
      } else if (isDragging.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        if (x >= 100) {
          if (x < 400 && !collapseTreeView) {
            setCollapseTreeView(true);
          } else {
            setCollapseTreeView(false);
          }
          setDivider(x);
          sessionStorage.setItem('divider', x + '');
        }
      }
    },
    []
  );

  const onTouchMove = useCallback(
    (evt: React.TouchEvent<HTMLDivElement> | any) => {
      if (isDragging.current) {
        const touchEvt = evt.changedTouches[0];
        if (touchEvt) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = touchEvt.clientX - rect.left;
          if (x >= 100) {
            if (x < 400 && !collapseTreeView) {
              setCollapseTreeView(true);
            } else {
              setCollapseTreeView(false);
            }
            setDivider(x);
            sessionStorage.setItem('divider', x + '');
          }
        }
      }
    },
    []
  );

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = 'auto';
  }, []);

  const stateSnapshot = () => {
    appStateContext.dispatch((dispatch, getState) => {
      const patch = createAppStatePatch(getState(), initialAppState);
      console.log(JSON.stringify(patch, null, 2));
    });
  };

  const onKeyDown = useCallback((evt: React.KeyboardEvent<Window> | any) => {
    if (!(evt.ctrlKey && evt.shiftKey)) {
      return;
    }
    switch (evt.keyCode) {
      case 83: // s
        stateSnapshot();
        evt.preventDefault();
        break;
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = 'auto';
  }, []);

  return (
    <Flex direction="row" flexGrow={1} ref={containerRef} height="100%">
      <Stack
        flexDirection="column"
        flexGrow={1}
        position="fixed"
        width="100vw"
        backgroundColor={colorMode !== 'dark' ? 'white' : 'gray.800'}
        zIndex={5}
      >
        <ResponsiveHeader />
        <Divider />
      </Stack>

      <Flex direction="column" pt={14} flexGrow={1}>
        <Skeleton isLoaded={isSpecificationReady}>
          {isSpecificationReady && !isTreeViewExpanded && (
            <>
              <Flex
                width={divider}
                position="fixed"
                bottom={0}
                height="100vh"
                pt={16}
              >
                {collapseTreeView ? (
                  <Stack
                    direction="row"
                    flexGrow={1}
                    userSelect="none"
                    alignItems="center"
                    spacing={2}
                    overflow="hidden"
                  >
                    <Stack direction="row" flexGrow={1}>
                      <Text fontSize="xs" flexGrow={1} textAlign="right">
                        DRAG RIGHT
                      </Text>
                      <FaHandPointRight />
                    </Stack>
                  </Stack>
                ) : (
                  <ResponsiveTreeView />
                )}
                <Flex
                  ml={2}
                  direction="row"
                  p={2}
                  cursor="w-resize"
                  onMouseDown={onMouseDown}
                  onTouchStart={onTouchStart}
                  userSelect="none"
                  alignItems="center"
                >
                  <Box
                    height="15vh"
                    width={2}
                    borderRadius="md"
                    color="gray.600"
                    borderWidth="1px"
                  />
                </Flex>
              </Flex>

              <Stack flexGrow={1} ml={divider} pl={2} pt={10} pr={12} pb={12}>
                <ResponsiveContent />
              </Stack>
            </>
          )}
          {isSpecificationReady && isTreeViewExpanded && (
            <>
              <Flex
                position="fixed"
                bottom={0}
                height="100vh"
                width="100vw"
                pt={16}
              >
                <ResponsiveTreeView />
              </Flex>
            </>
          )}
        </Skeleton>
      </Flex>
    </Flex>
  );
}

export default ResponsiveLayout;
