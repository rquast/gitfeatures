import React, { useContext, useRef } from 'react';
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text
} from '@chakra-ui/react';
import useAppState from '../../hooks/useAppState';
import { store as appStateStore } from '../../context/AppStateContext';
import ExampleMappingDrawerView from './ExampleMappingDrawerView';
import { FaTimes } from 'react-icons/fa';

function HelpDrawer() {
  const appStateContext = useContext(appStateStore);

  const { isHelpDrawerOpen, onCloseHelpDrawer } = useAppState();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const getTitle = (): string => {
    switch (appStateContext.state.helpDrawer.view) {
      case 'example-mapping-tutorial':
        return 'Example Mapping Tutorial';
      default:
        return '';
    }
  };

  const getBody = (): JSX.Element => {
    switch (appStateContext.state.helpDrawer.view) {
      case 'example-mapping-tutorial':
        return <ExampleMappingDrawerView />;
      default:
        return <Text>Not Found</Text>;
    }
  };

  return (
    <>
      <Drawer
        isOpen={isHelpDrawerOpen}
        placement="right"
        onClose={onCloseHelpDrawer}
        finalFocusRef={buttonRef}
        size="xl"
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              {getTitle()}
              <Divider mt={4} />
            </DrawerHeader>
            <DrawerBody>{getBody()}</DrawerBody>
            <DrawerFooter>
              <Button
                ref={buttonRef}
                variant="outline"
                mr={3}
                onClick={onCloseHelpDrawer}
                leftIcon={<FaTimes />}
              >
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}

export default HelpDrawer;
