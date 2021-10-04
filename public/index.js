const express = require('express');
const helmet = require('helmet');
const open = require('open');
const corsProxy = require('@isomorphic-git/cors-proxy/middleware.js');

const load = (
  html = '',
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