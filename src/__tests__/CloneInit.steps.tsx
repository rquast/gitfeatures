import {
  parseFeature,
  defineFeature,
  getGherkinTestKitConfiguration
} from 'gherkin-testkit';
import { expect } from 'chai';

import React, { useContext, useEffect } from 'react';
import { render } from '@testing-library/react';
import TestContainer from '../containers/TestContainer';
import { test1 } from '../fixtures/modal/cloneInitFixture';
import { ColorModeScript } from '@chakra-ui/react';
import { AppStateProvider } from '../context/AppStateContext';
import { SpecificationProvider } from '../context/SpecificationContext';
import { ExampleMapProvider } from '../context/ExampleMapContext';
import type { Action, GitProfile } from '../types';
import GitActionsModal from '../components/modal/GitActionsModal';
import { store as appStateStore } from '../context/AppStateContext';

//@ts-ignore
import { plainText as CloneInitFeature } from '@virtual:plain-text/src/__tests__/CloneInit.feature';

const StateWrapper = function ({
  children,
  action
}: {
  children: JSX.Element | JSX.Element[];
  action: Action;
}) {
  const appStateContext = useContext(appStateStore);

  useEffect(() => {
    if (action) {
      appStateContext.dispatch(action);
    }
  }, [action]);

  return <>{children}</>;
};

const TestWrapper = function ({
  children,
  action
}: {
  children: JSX.Element | JSX.Element[];
  action: Action;
}) {
  return (
    <React.StrictMode>
      <TestContainer>
        <ColorModeScript initialColorMode="dark" />
        <AppStateProvider persistence={() => {}}>
          <SpecificationProvider persistence={() => {}}>
            <ExampleMapProvider persistence={() => {}}>
              <StateWrapper action={action}>{children}</StateWrapper>
            </ExampleMapProvider>
          </SpecificationProvider>
        </AppStateProvider>
      </TestContainer>
    </React.StrictMode>
  );
};

const feature = parseFeature(
  CloneInitFeature,
  getGherkinTestKitConfiguration({})
);

defineFeature(feature, (test) => {
  test('Valid URL given for something that exists in localStorage', ({
    given,
    when,
    then
  }) => {
    given('a user wants to load a project already in localStorage', () => {
      expect(true).to.equal(true);
    });

    when('the user enters a URL that matches', () => {
      expect(true).to.equal(true);
    });

    then('the system renders what is in localStorage', () => {
      expect(true).to.equal(true);
    });
  });
  test("ONE - Valid URL given that hasn't been cloned or initialized", ({
    given,
    when,
    then,
    and
  }) => {
    given(
      "a user wants to clone, load or create something that isn't in localStorage",
      () => {
        expect(true).to.equal(true);
      }
    );

    when('the user enters a URL that is not in localStorage', () => {
      expect(true).to.equal(true);
    });

    then('the template stub is rendered', () => {
      expect(true).to.equal(true);
    });

    and('the clone/init modal is displayed after a short delay', () => {
      expect(true).to.equal(true);
    });
  });
  test('Parsing broken JSON causes error', ({ given, and, when, then }) => {
    given('a user wants to load an existing project from localStorage', () => {
      expect(true).to.equal(true);
    });

    and('the project in localStorage has a JSON error', () => {});

    when('the user enters a valid URL to bring up this project', () => {});

    then('the system displays an error', () => {});

    and('renders the stub template', () => {});

    and('displays the clone/init modal aftewards', () => {});
  });
  test('Reading document causes error', ({ given, and, when, then }) => {
    given(
      'a user wants to load an existing project from localStorage',
      () => {}
    );

    and(
      'the project in localStorage contains a parsing error in the specification.yml file',
      () => {}
    );

    when('the user enters a valid URL to bring up this project', () => {});

    then('the system displays an error', () => {});

    and('renders the stub template', () => {});

    and('displays the clone/init modal afterwards', () => {});
  });
  test("URL that hasn't been cloned", ({ given, when, then }) => {
    given("a user wants to enter a URL that isn't in localStorage", () => {});

    when('the user changes the URL', () => {});

    then('the system renders the stub template', () => {});
  });
  test('URL is pttp://myfakeurl.com/fakeproject.git', ({
    given,
    when,
    then
  }) => {
    given('a user wants to clone a project', () => {});

    when(/^the user enters the URL as (.*)$/, (arg0) => {});

    then('the system shows a URL validation error', () => {});
  });
  test('URL is https://github.com/sengac/gitfeatures-spec.git', ({
    given,
    when,
    then,
    and
  }) => {
    given('a user wants to clone a project', () => {});

    when(/^the user enters the URL as (.*)$/, (arg0) => {});

    then('the system clones the URL', () => {});

    and('renders the URL', () => {});
  });
  test("TWO - Valid URL given that hasn't been cloned or initialized", ({
    given,
    when,
    then,
    and
  }) => {
    given("a user wants to enter a URL that isn't in localStorage", () => {});

    when('the user changes the URL', () => {});

    then('the system renders the stub template', () => {});

    and('the system displays the clone/init modal shortly after', () => {});
  });
  test('URL has small typo in it that needs fixing to load', ({
    given,
    but,
    when,
    and,
    then
  }) => {
    given('a user wanted to load a URL that is in localStorage', () => {});

    but('the user had a typo in the URL', () => {});

    when('the user is at the clone/init modal', () => {
      const { getByText } = render(
        <TestWrapper
          action={{
            type: 'PATCH',
            payload: JSON.parse(JSON.stringify(test1))
          }}
        >
          <GitActionsModal
            cloneFn={(url: string, gitProfile: GitProfile) => {
              return Promise.resolve('done');
            }}
            initFn={(url: string, branch: string, remote: string) => {
              return Promise.resolve();
            }}
          />
        </TestWrapper>
      );
      const linkElement = getByText(/Clone Repository/i);
      expect(document.body.contains(linkElement));
    });

    and('the user fixes the URL', () => {});

    and('the user clicks the reload button', () => {});

    then('the system renders the fixed URL from localStorage', () => {});
  });
  test('User provides valid Git repository zip', ({
    given,
    and,
    when,
    then
  }) => {
    given('a user is at the clone/modal dialog', () => {});

    and('the user has a valid Git repository zip file', () => {});

    when(/^the user clicks the (.*) button$/, (arg0) => {});

    then('the user is prompted to upload a zip file', () => {});

    and('the system processes the zip file', () => {});

    and('the system renders the repository', () => {});
  });
  test('User provides invalid Git repository zip', ({
    given,
    and,
    when,
    then
  }) => {
    given('a user is at the clone/modal dialog', () => {});

    and('the user has an ivalid Git repository zip file', () => {});

    when(/^the user clicks the (.*) button$/, (arg0) => {});

    then('the user is prompted to upload a zip file', () => {});

    and('the system processes the zip file', () => {});

    and('the system shows a toast error message', () => {});

    and('the system displays the clone/init modal again', () => {});
  });
  test('Display input area for URL', ({ given, and, when, then }) => {
    given('a user wants to create a new project', () => {});

    and('the clone/init modal is being displayed to the user', () => {});

    when('the user wishes to change the URL for this project', () => {});

    then('the user can edit the URL input field', () => {});
  });
  test('Dropdown list with default credentials selected', ({
    given,
    when,
    then,
    and
  }) => {
    given('a user wants to select custom credentials', () => {});

    when('the user clicks on the credentials dropdown list', () => {});

    then('their custom credentials should be displayed', () => {});

    and('the custom credentials can be selected', () => {});
  });
  test('Button to edit credentials', ({ given, when, then, and }) => {
    given('a user wants to edit or add git credentials', () => {});

    when('the user clicks the edit credentials button', () => {});

    then('the clone/init modal is closed', () => {});

    and('the git credentials modal is opened', () => {});

    and(
      'the clone/init modal is opened again once the credentials modal is closed',
      () => {}
    );
  });
  test('Button appears to clone or initialize', ({
    given,
    when,
    then,
    and
  }) => {
    given('a user wants to clone or intialize a project', () => {});

    when('the user enters a URL that is not in localStorage', () => {});

    then('the clone/init modal appears', () => {});

    and(/^a button for (.*) can be selected$/, (arg0) => {});

    and(/^a button for (.*) can be selected$/, (arg0) => {});
  });
  test('Explanation of what "initialize" does', ({
    given,
    when,
    then,
    and
  }) => {
    given('a user wants to clone or initialize a project', () => {});

    when('the user is at the clone/init modal', () => {});

    then(
      'the user should see an explanation of clone beside the clone button',
      () => {}
    );

    and(
      'the user should see and explanation of init beside the init button',
      () => {}
    );
  });
  test('Clone a repository with master branch', ({ given, when, then }) => {
    given('a user wants to clone a project that has a master branch', () => {});

    when(/^the user clones the project using the (.*) branch$/, (arg0) => {});

    then('the document can be rendered', () => {});
  });
  test('Clone a repository with a main branch using master', ({
    given,
    when,
    then
  }) => {
    given('a user wants to clone a project that has a main branch', () => {});

    when(/^the user clones the project using the (.*) branch$/, (arg0) => {});

    then('the document cannot be rendered', () => {});
  });
  test('No cross at the top of the screen', ({ given, when, then }) => {
    given('a user enters a URL that is not in localStorage', () => {});

    when('the user is shown the clone/init modal', () => {});

    then('the user cannot close the modal with a close button', () => {});
  });
  test('Esc key is disabled', ({ given, when, then }) => {
    given('a user enters a URL that is not in localStorage', () => {});

    when('the user is shown the clone/init modal', () => {});

    then('the user cannot use the escape key to close the modal', () => {});
  });
  test("Rollback can't appear before first commit after change", ({
    given,
    when,
    and,
    then
  }) => {
    given(
      'a user has just initialized a project and done nothing else',
      () => {}
    );

    when('a user saves a change to a document', () => {});

    and(/^the user clicks the (.*) button$/, (arg0) => {});

    then(/^the (.*) button is disabled$/, (arg0) => {});
  });
  test('Must empty lightning-fs for newly a initialized URL', ({
    given,
    when,
    then
  }) => {
    given(
      /^there is a file called (.*) in the browser for this URL$/,
      (arg0) => {}
    );

    when('a initializes a project for the URL', () => {});

    then('the file no longer exists', () => {});
  });
  test('401 unauthorized', ({ given, and, when, then }) => {
    given('a user has a private repository', () => {});

    and('the user has stored incorrect credentials', () => {});

    when('the user attempts to clone the repository', () => {});

    then('the system shows a clone error', () => {});

    and('the system shows the clone/init modal again', () => {});
  });
  test('Other network errors', ({ given, and, when, then }) => {
    given('a user wishes to clone a repository', () => {});

    and("the user's internet connection is not working", () => {});

    when('the user attempts to clone the repository', () => {});

    then('the system shows a clone error', () => {});

    and('the system shows the clone/init modal again', () => {});
  });
});
