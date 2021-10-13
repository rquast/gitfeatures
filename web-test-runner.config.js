process.env.NODE_ENV = 'test';
const vite = require("vite-web-test-runner-plugin");
const { playwrightLauncher } = require('@web/test-runner-playwright');

const ignoredBrowserLogs = [
  '[vite] connecting...',
  '[vite] connected.',
];

module.exports = {
  testsFinishTimeout: 3600000, // 1 hour
  coverageConfig: {
    include: [
      'src/**/*.{js,jsx,ts,tsx}'
    ],
    // exclude: ['**/*/_snowpack/**/*'],
  },
  plugins: [vite()],
  testRunnerHtml: testFramework => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GitFeatures: BDD specification writing tool" />
        <meta name="gf:config" content="%7B%22currentRepositoryURL%22%3A%22https%3A%2F%2Fgithub.com%2Fsengac%2Fgitfeatures-spec.git%22%2C%22localRepositories%22%3A%7B%7D%2C%22isCommitPushChecked%22%3Afalse%2C%22gitProfiles%22%3A%7B%22Default%22%3A%7B%22profile-name%22%3A%22Default%22%2C%22cors-proxy-address%22%3A%22https%3A%2F%2Fcors.gitfeatures.com%22%2C%22author-name%22%3A%22Sir%20Testsalot%22%2C%22author-email%22%3A%22sir%40testsalot.com%22%2C%22default-branch%22%3A%22master%22%2C%22remote-name%22%3A%22origin%22%2C%22pgp-private-key%22%3A%22%22%2C%22username%22%3A%22sirtestsalot%22%2C%22password%22%3A%22%22%7D%7D%7D" />
        <style type="text/css">
            html, body {
                overscroll-behavior: contain;
                overscroll-behavior-y: contain;
                height: 100%;
                margin: 0;
            }
        </style>    
        <script type="module">
          // Note: globals expected by @testing-library/react
          window.global = window;
          window.process = { env: {} };
          // Note: adapted from https://github.com/vitejs/vite/issues/1984#issuecomment-778289660
          // Note: without this you'll run into https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201
          window.__vite_plugin_react_preamble_installed__ = true;
        </script>
        <script type="module" src="${testFramework}"></script>
      </head>
    </html>
  `,
  filterBrowserLogs: ({ args }) => {
    return !args.some((arg) => ignoredBrowserLogs.includes(arg));
  },
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      launchOptions: {
        headless: false,
        devtools: false
      },
    }),
    /*
    playwrightLauncher({
      product: 'firefox',
      launchOptions: {
        headless: true,
        devtools: false
      },
    }),
    playwrightLauncher({
      product: 'webkit',
      launchOptions: {
        headless: true,
        devtools: false
      },
    }),
    */
  ]
};