export const test1 = [
  {
    op: 'replace',
    path: '/gitActionsModal/view',
    value: 'clone-repository'
  },
  {
    op: 'replace',
    path: '/gitActionsModal/isOpen',
    value: true
  },
  {
    op: 'replace',
    path: '/config',
    value: {
      currentRepositoryURL: 'https://github.com/sengac/gitfeatures-spec.git',
      localRepositories: {
        'https://github.com/rquast/gitfeatures-spec.git': {
          'git-profile-name': 'Default',
          'current-branch': 'master'
        },
        'https://github.com/sengac/gitfeatures-spec.git': {
          'git-profile-name': 'Default',
          'current-branch': 'master'
        }
      },
      gitProfiles: {
        Default: {
          'profile-name': 'Default',
          'cors-proxy-address': 'https://cors.gitfeatures.com',
          'author-name': 'Roland Quast',
          'author-email': 'rquast@rolandquast.com',
          'default-branch': 'master',
          'remote-name': 'origin',
          'pgp-private-key': '',
          username: 'testing',
          password: ''
        }
      },
      isCommitPushChecked: true
    }
  }
];
