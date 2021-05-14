const express = require('express');
const helmet = require('helmet');
const open = require('open');
const corsProxy = require('@isomorphic-git/cors-proxy/middleware.js');

function getContentSecurityPolicy(proxies) {
  return `default-src 'self' ${proxies}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: 'unsafe-eval';`;
}

const load = (
  title = 'GitFeatures',
  description = 'GitFeatures: BDD specification writing tool',
  port = 25921,
  proxies = 'localhost:25921 cors.gitfeatures.com',
  config = {
    currentRepositoryURL: 'https://github.com/sengac/gitfeatures-spec.git',
    localRepositories: {},
    isCommitPushChecked: false,
    gitProfiles: {
      Default: {
        'profile-name': 'Default',
        'cors-proxy-address': 'http://localhost:25921',
        'author-name': 'Sir Testsalot',
        'author-email': 'sir@testsalot.com',
        'default-branch': 'master',
        'remote-name': 'origin',
        'pgp-private-key': '',
        'username': 'sirtestsalot',
        'password': ''
      }
    }
  },
  isLaunchingBrowser = true
) => {

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="${getContentSecurityPolicy(proxies)}">
      <link rel="icon" href="/favicon.ico" />
      <link rel="stylesheet" href="/_dist_/index.css" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="${description}" />
      <meta name="gf:config" content="${encodeURIComponent(JSON.stringify(config))}" />
      <title>${title}</title>
      <style type="text/css">
          html, body {
              overscroll-behavior: contain;
              overscroll-behavior-y: contain;
              height: 100%;
              margin: 0;
          }
      </style>
    </head>
    <body>
    <div id="root"></div>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <script type="module" src="/_dist_/index.js"></script>
    </body>
    </html>
  `;

  const app = express();
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());

  const options = {};

  app.use(corsProxy(options));

  app.get(['/', '/index.html'], (req, res) => {
    res.send(html.trim());
  });

  app.use('/', express.static('./', {
    index: false
  }));

  app.listen(port, '0.0.0.0', async () => {
    console.log(`GitFeatures listening at http://localhost:${port}`);
    if (isLaunchingBrowser) {
      await open(`http://localhost:${port}`);
    }
  });

};

module.exports = load;