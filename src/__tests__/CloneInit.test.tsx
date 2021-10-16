import React from 'react';
import { render } from '@testing-library/react';
import TestContainer from '../containers/TestContainer';
import CloneInitHarness from '../fixtures/modal/CloneInitHarness';
import { test1 } from '../fixtures/modal/cloneInitFixture';
import { expect } from 'chai';
import { ColorModeScript } from '@chakra-ui/react';
import { AppStateProvider } from '../context/AppStateContext';
import { SpecificationProvider } from '../context/SpecificationContext';
import { ExampleMapProvider } from '../context/ExampleMapContext';

describe('<CloneInitHarness>', () => {
  it('renders the clone/init modal', async () => {
    const { getByText } = render(
      <React.StrictMode>
        <TestContainer>
          <ColorModeScript initialColorMode="dark" />
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
        </TestContainer>
      </React.StrictMode>
    );
    const linkElement = getByText(/Clone Repository/i);
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(true);
    //   }, 2000);
    // });
    // debugger;
    expect(document.body.contains(linkElement));
  });
});
