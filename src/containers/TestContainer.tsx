import React from 'react';
import { theme, ChakraProvider } from '@chakra-ui/react';
import Fonts from '../utils/Fonts';

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

function TestContainer({ children }: any) {
  return (
    <ChakraProvider resetCSS theme={customTheme}>
      <Fonts />
      {children}
    </ChakraProvider>
  );
}

export default TestContainer;
