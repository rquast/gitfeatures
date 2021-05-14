import React from 'react';
import { theme, ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import 'react-sortable-tree/style.css'; // only import once
import Fonts from '../utils/Fonts';
import { AppStateProvider } from '../context/AppStateContext';
import { SpecificationProvider } from '../context/SpecificationContext';
import { ExampleMapProvider } from '../context/ExampleMapContext';
import App from '../components/app/App';
import Harness from '../fixtures/Harness';
import CloneInitHarness from '../fixtures/modal/CloneInitHarness';
import { test1 } from '../fixtures/modal/cloneInitFixture';

function QueryStringRouter() {
  // TODO: implement and disable for non-dev environments
  const urlParams = new URLSearchParams(window.location.search);
  const testComponent = urlParams.get('test-component');
  if (typeof testComponent === 'string') {
    switch (testComponent) {
      case 'CloneInit':
        return (
          <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <AppStateProvider persistence={() => {}}>
              <SpecificationProvider persistence={() => {}}>
                <ExampleMapProvider persistence={() => {}}>
                  <CloneInitHarness
                    action={{
                      type: 'PATCH',
                      payload: JSON.parse(JSON.stringify(test1))
                    }}
                  />
                </ExampleMapProvider>
              </SpecificationProvider>
            </AppStateProvider>
          </>
        );
      default:
    }
  }
  const harnessComponent = urlParams.get('harness');
  if (typeof harnessComponent === 'string') {
    switch (harnessComponent) {
      default:
        return (
          <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <Harness urlParams={urlParams} />
          </>
        );
    }
  }
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AppStateProvider>
        <SpecificationProvider>
          <ExampleMapProvider>
            <App />
          </ExampleMapProvider>
        </SpecificationProvider>
      </AppStateProvider>
    </>
  );
}

const customTheme = {
  ...theme,
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    mono: 'Inter, sans-serif'
  },
  colors: {
    ...theme.colors,
    brand: {
      900: '#1a365d',
      800: '#153e75',
      700: '#2a69ac'
    }
  }
};

function AppContainer({ children }: any) {
  return (
    <ChakraProvider resetCSS theme={customTheme}>
      <Fonts />
      {children ? children : <QueryStringRouter />}
    </ChakraProvider>
  );
}

export default AppContainer;
