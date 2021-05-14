import type { GitConfig, GitProfile } from '../types';

const lookupCurrentBranch = (url: string, config: GitConfig): string => {
  return config.localRepositories[url]['current-branch'];
};

const lookupCurrentProfile = (url: string, config: GitConfig): GitProfile => {
  const gitProfileName = config.localRepositories[url]['git-profile-name'];
  if (config.gitProfiles[gitProfileName]) {
    return config.gitProfiles[gitProfileName];
  } else {
    return config.gitProfiles['Default'];
  }
};

export { lookupCurrentBranch, lookupCurrentProfile };
