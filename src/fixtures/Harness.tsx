import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Heading,
  IconButton,
  Link,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorMode
} from '@chakra-ui/react';
import { ExternalLinkIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import CodeEditor from '../components/editor/CodeEditor';
import { test1 } from './modal/cloneInitFixture';
import CloneInitHarness from './modal/CloneInitHarness';
import type { Action, AppState, MapTreesState, SpecTreeState } from '../types';
import { AppStateProvider } from '../context/AppStateContext';
import { SpecificationProvider } from '../context/SpecificationContext';
import { ExampleMapProvider } from '../context/ExampleMapContext';

function mockPersistState(
  key: string,
  state: AppState | SpecTreeState | MapTreesState,
  url?: string
) {
  switch (key) {
    case 'config':
      if (state.touched && 'config' in state && state.config) {
        console.log('PERSIST CONFIG', state.config, state.touched);
      }
      break;
    case 'spec-tree':
      if ('undo' in state && 'redo' in state && 'tree' in state && state.tree) {
        if (
          state.touched ||
          Object.keys(state.undo || {}).length > 0 ||
          Object.keys(state.redo || {}).length > 0
        ) {
          console.log(
            'PERSIST SPEC TREE',
            state.tree,
            state.touched,
            state.renameKeys,
            url || ''
          );
        }
      }
      break;
    case 'map-tree':
      if (
        'undo' in state &&
        'redo' in state &&
        'trees' in state &&
        state.trees
      ) {
        if (
          state.touched ||
          Object.keys(state.undo || {}).length > 0 ||
          Object.keys(state.redo || {}).length > 0
        ) {
          console.log(
            'PERSIST EXAMPLE MAP TREES',
            state.trees,
            state.touched,
            state.renameKeys,
            url || ''
          );
        }
      }
      break;
  }
}

function Harness({ urlParams }: { urlParams: any }) {
  const [patch, setPatch] = useState<string>('');
  const [action, setAction] = useState<Action | null>(null);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    setPatch(JSON.stringify(test1, null, 2));
    setAction(null);
  }, []);

  return (
    <AppStateProvider persistence={mockPersistState}>
      <SpecificationProvider persistence={mockPersistState}>
        <ExampleMapProvider persistence={mockPersistState}>
          <Stack wrap="nowrap" minHeight="100%" p={8} spacing={4}>
            <Stack direction="row">
              <Heading size="lg" flexGrow={1}>
                Component Harness
              </Heading>
              <Tooltip
                hasArrow
                label="Toggle Dark Mode"
                bg="blue.600"
                color="white"
              >
                <IconButton
                  onClick={toggleColorMode}
                  size="md"
                  variant="ghost"
                  aria-label="Toggle Dark Mode"
                  icon={
                    colorMode === 'dark' ? (
                      <SunIcon />
                    ) : (
                      <MoonIcon color="gray.500" />
                    )
                  }
                />
              </Tooltip>
            </Stack>
            <Text>
              A harness for individual component testing by mutating context
              state using{' '}
              <Link
                href="https://github.com/Starcounter-Jack/JSON-Patch"
                isExternal
              >
                JSON-Patch
              </Link>
              <ExternalLinkIcon mx="2px" />
            </Text>
            <Divider />
            <Tabs isLazy orientation="horizontal" pt={8}>
              <TabList>
                <Tab>Modal</Tab>
                <Tab>View</Tab>
                <Tab>Renderer</Tab>
                <Tab>Picker</Tab>
                <Tab>Editor</Tab>
                <Tab>Input</Tab>
                <Tab>Tree</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Tabs
                    isLazy
                    orientation="vertical"
                    onChange={() => {
                      setAction(null);
                    }}
                  >
                    <TabList>
                      <Tab>Clone/Init</Tab>
                      <Tab>Settings</Tab>
                      <Tab>Three</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <Stack>
                          <Text>Display the Clone / Init Modal Dialog</Text>
                          <CodeEditor
                            language="javascript"
                            isEditing={true}
                            content={patch}
                            onContentChange={setPatch}
                          />
                          <Stack direction="row">
                            <Button
                              onClick={() => {
                                setAction({
                                  type: 'PATCH',
                                  payload: JSON.parse(patch)
                                });
                              }}
                            >
                              Patch State
                            </Button>
                            <Button>Revert State</Button>
                          </Stack>
                        </Stack>

                        <CloneInitHarness action={action} />
                      </TabPanel>
                      <TabPanel>
                        <p>two!</p>
                      </TabPanel>
                      <TabPanel>
                        <p>three!</p>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <p>two!</p>
                </TabPanel>
                <TabPanel>
                  <p>three!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </ExampleMapProvider>
      </SpecificationProvider>
    </AppStateProvider>
  );
}

export default Harness;
