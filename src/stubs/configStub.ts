import type { GitConfig } from '../types';

export default {
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
      username: 'sirtestsalot',
      password: ''
    }
  }
} as GitConfig;
