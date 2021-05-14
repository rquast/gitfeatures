// NODE_ENV=test - Needed by "@snowpack/web-test-runner-plugin"
process.env.NODE_ENV = 'test';
const { playwrightLauncher } = require('@web/test-runner-playwright');

module.exports = {
  testsFinishTimeout: 3600000, // 1 hour
  coverageConfig: {
    exclude: ['**/*/_snowpack/**/*'],
  },
  plugins: [require('@snowpack/web-test-runner-plugin')()],
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      launchOptions: {
        headless: true,
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