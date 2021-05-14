'use strict';
const fs = require('fs');

const defaultConfig = {
  currentRepositoryURL: 'https://github.com/sengac/gitfeatures-spec.git',
  localRepositories: {},
  isCommitPushChecked: false,
  gitProfiles: {
    Default: {
      'profile-name': 'Default',
      'cors-proxy-address': 'https://cors.gitfeatures.com',
      'author-name': 'Sir Testsalot',
      'author-email': 'sir@testsalot.com',
      'default-branch': 'master',
      'remote-name': 'origin',
      'pgp-private-key': '',
      'username': 'sirtestsalot',
      'password': ''
    }
  }
};

function getProxies() {
  return 'localhost:25921 cors.gitfeatures.com';
}

function getContentSecurityPolicy(proxies) {
  if (process.env.NODE_ENV === 'production') {
    return `default-src 'self' ${proxies}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: 'unsafe-eval';`;
  } else {
    return `default-src 'self' 'unsafe-inline' ${proxies}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: 'unsafe-eval';`;
  }
}

function getConfig() {
  return encodeURIComponent(JSON.stringify(defaultConfig));
}

function getTitle() {
  return 'GitFeatures';
}

function getDescription() {
  return 'GitFeatures: BDD specification writing tool';
}

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${getContentSecurityPolicy(getProxies())}">
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${getDescription()}" />
  <meta name="gf:config" content="${getConfig()}" />
  <title>${getTitle()}</title>
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

fs.writeFile('public/index.html', html.trim(), function (err) {
  if (err) return console.log(err);
});
