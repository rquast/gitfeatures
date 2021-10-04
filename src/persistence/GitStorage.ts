// @ts-ignore
import FS from '@isomorphic-git/lightning-fs';
import git from 'isomorphic-git';
import type { CallbackFsClient, PromiseFsClient } from 'isomorphic-git/index';

// @ts-ignore
import { pgp } from '@isomorphic-git/pgp-plugin';
import http from 'isomorphic-git/http/web/index.js';
import YAML from 'yaml';
import JSZip from 'jszip';
import {
  getTreeNodesAsArray,
  immutableFeatureToggles,
  immutableTreeKeyFilter
} from '../utils/TreeUtils';
import { lookupCurrentBranch, lookupCurrentProfile } from '../utils/GitUtils';
import type {
  AppState,
  Auth,
  CloneRepositoryParms,
  FeatureToggles,
  GitConfig,
  GitProfile,
  InitRepositoryParms,
  MapNode,
  MapTreesState,
  MapTreeState,
  RenameKeys,
  SpecNode,
  SpecTreeState
} from '../types';

const CONFIG_PREFIX = 'config';
const EXAMPLE_MAP_TREES_PREFIX = 'map-';
const SPECIFICATION_TREE_PREFIX = 'spec-';

const lfs: {
  [key: string]: PromiseFsClient;
} = {};

const initFS = async (
  url: string,
  wipe: boolean = false
): Promise<PromiseFsClient> => {
  if (!lfs[url] || wipe) {
    const fs = new FS();
    await fs.promises.init(url, { wipe });
    lfs[url] = fs;
  }
  return lfs[url];
};

const deleteLocalRepository = async (url: string): Promise<void> => {
  await initFS(url, true);
  localStorage.removeItem(`${EXAMPLE_MAP_TREES_PREFIX}${url}`);
  localStorage.removeItem(`${SPECIFICATION_TREE_PREFIX}${url}`);
};

const addZipDir = async function (
  zip: JSZip,
  fs: PromiseFsClient,
  path: string
) {
  const files: string[] = await fs.promises.readdir(path);
  for (const filename of files) {
    const stat = await fs.promises.stat(path + '/' + filename);
    if (stat.isDirectory()) {
      await addZipDir(zip, fs, path + '/' + filename);
    } else {
      const fileContent: Uint8Array | string = await fs.promises.readFile(
        `${path}/${filename}`
      );
      zip.file((path + '/' + filename).slice(1), fileContent);
    }
  }
};

const downloadLocalRepository = async (url: string): Promise<Blob> => {
  const fs = await initFS(url);
  const zip: JSZip = new JSZip();
  const files: string[] = await fs.promises.readdir('/');
  for (const file of files) {
    const stat = await fs.promises.stat('/' + file);
    if (stat.isDirectory()) {
      await addZipDir(zip, fs, '/' + file);
    } else {
      const fileContent: Uint8Array | string = await fs.promises.readFile(
        `/${file}`
      );
      zip.file(file, fileContent);
    }
  }
  return await zip.generateAsync({ type: 'blob' });
};

const fetchFileAsBlob = async (
  url: string,
  file: string,
  guessMimeType: boolean = false
): Promise<Blob | null> => {
  const fs = await initFS(url);
  try {
    await fs.promises.stat(`/${file}`);
    const fileContent: Uint8Array | string = await fs.promises.readFile(
      `/${file}`
    );
    let type = 'application/octet-stream';
    if (guessMimeType) {
      const extension = file.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'svg':
          type = 'image/svg+xml';
          break;
        case 'apng':
          type = 'image/apng';
          break;
        case 'avif':
          type = 'image/avif';
          break;
        case 'gif':
          type = 'image/gif';
          break;
        case 'jpeg':
        case 'jpg':
          type = 'image/jpg';
          break;
        case 'png':
          type = 'image/png';
          break;
        case 'webp':
          type = 'image/webp';
          break;
      }
    }
    return new Blob([fileContent], { type });
  } catch (e) {
    return Promise.resolve(null);
  }
};

const isFileInRepository = async (
  url: string,
  file: string
): Promise<boolean> => {
  const fs = await initFS(url);
  try {
    await fs.promises.stat(`/${file}`);
    return true;
  } catch (e) {
    return false;
  }
};

const deleteFileFromRepo = async (url: string, file: string) => {
  const fs: PromiseFsClient | CallbackFsClient = await initFS(url);
  await git.remove({ fs, dir: '/', filepath: 'files/' + file });
  await fs.promises.unlink(`/files/${file}`);
};

const uploadFileToRepo = async (
  url: string,
  filename: string,
  fileData: Uint8Array
) => {
  const fs = await initFS(url);
  try {
    await fs.promises.stat('/files');
  } catch (e) {
    await fs.promises.mkdir('/files');
  }
  await fs.promises.writeFile(`/files/${filename}`, fileData);
};

const listFilesInRepo = async (url: string, path: string) => {
  const fs = await initFS(url);
  try {
    await fs.promises.stat(path);
    const files = await fs.promises.readdir(path);
    if (files.indexOf('.git') >= 0) {
      files.splice(files.indexOf('.git'), 1);
    }
    return files;
  } catch (e) {
    return [];
  }
};

const cloneRepo: CloneRepositoryParms = async (
  url: string,
  gitProfile: GitProfile
) => {
  const fs = await initFS(url, true);
  const dir = '/';
  await git.clone({
    fs,
    http,
    gitdir: '/.git',
    dir,
    corsProxy: gitProfile['cors-proxy-address'],
    url,
    ref: gitProfile['default-branch'],
    singleBranch: true,
    depth: 1,
    onAuth: () => getAuth(gitProfile)
  });
  const currentBranch = await git.currentBranch({
    fs,
    dir: '/',
    fullname: false
  });
  const { specTree, mapTrees } = await hydrate(url);
  saveSpecificationTree(specTree, undefined, {}, url);
  saveExampleMapTrees(mapTrees, undefined, {}, url);
  return currentBranch;
};

const fetchLocalMapState = (url: string) => {
  let localState;
  try {
    const str = localStorage.getItem(`${EXAMPLE_MAP_TREES_PREFIX}${url}`);
    if (str) {
      localState = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }
  return localState;
};

const fetchLocalConfigState = () => {
  let localState;
  try {
    const str = localStorage.getItem(CONFIG_PREFIX);
    if (str) {
      localState = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }
  return localState;
};

const fetchLocalSpecState = (url: string) => {
  let localState;
  try {
    const str = localStorage.getItem(`${SPECIFICATION_TREE_PREFIX}${url}`);
    if (str) {
      localState = JSON.parse(str);
    }
  } catch (e) {
    console.error(e);
  }
  return localState;
};

const saveExampleMapTrees = (
  trees: { [key: string]: MapTreeState },
  touched: number | undefined,
  renameKeys: RenameKeys,
  url: string
) => {
  const clone: { [key: string]: MapTreeState } = {};
  for (const key in trees) {
    if (trees.hasOwnProperty(key)) {
      const state = trees[key];
      clone[key] = {
        tree: state.tree,
        selectedTreeIndex: 0,
        selectedNodeKey: undefined
      };
    }
  }
  localStorage.setItem(
    `${EXAMPLE_MAP_TREES_PREFIX}${url}`,
    JSON.stringify({
      touched,
      renameKeys,
      trees: clone
    })
  );
};

const saveSpecificationTree = (
  tree: SpecNode[],
  touched: number | undefined,
  renameKeys: RenameKeys,
  url: string
) => {
  localStorage.setItem(
    `${SPECIFICATION_TREE_PREFIX}${url}`,
    JSON.stringify({
      touched,
      renameKeys,
      tree
    })
  );
};

const saveConfig = (config: GitConfig, touched: number | undefined) => {
  localStorage.setItem(
    CONFIG_PREFIX,
    JSON.stringify({
      touched,
      config
    })
  );
};

const persistState = (
  key: string,
  state: AppState | SpecTreeState | MapTreesState,
  url?: string
) => {
  switch (key) {
    case 'config':
      if (state.touched && 'config' in state && state.config) {
        saveConfig(state.config, state.touched);
      }
      break;
    case 'spec-tree':
      if ('undo' in state && 'redo' in state && 'tree' in state && state.tree) {
        if (
          state.touched ||
          Object.keys(state.undo || {}).length > 0 ||
          Object.keys(state.redo || {}).length > 0
        ) {
          saveSpecificationTree(
            state.tree,
            state.touched,
            state.renameKeys,
            url || ''
          );
        }
      }
      break;
    case 'map-tree':
      if (
        'undo' in state &&
        'redo' in state &&
        'trees' in state &&
        state.trees
      ) {
        if (
          state.touched ||
          Object.keys(state.undo || {}).length > 0 ||
          Object.keys(state.redo || {}).length > 0
        ) {
          saveExampleMapTrees(
            state.trees,
            state.touched,
            state.renameKeys,
            url || ''
          );
        }
      }
      break;
  }
};

const initRepo: InitRepositoryParms = async (
  url: string,
  branch: string,
  remote: string
) => {
  const fs = await initFS(url, true);
  const dir = '/';
  await git.init({
    fs,
    dir,
    defaultBranch: branch
  });
  await git.addRemote({
    fs,
    dir,
    remote,
    url
  });
};

const changeRemotes = async (url: string) => {
  const fs = await initFS(url);
  const remotes = await git.listRemotes({ fs, dir: '/' });
  if (remotes) {
    for (const remote of remotes) {
      await git.deleteRemote({ fs, dir: '/', remote: remote.remote });
    }
  }
  await git.addRemote({
    fs,
    dir: '/',
    remote: 'origin',
    url
  });
  await git.branch({ fs, dir: '/', ref: 'main' });
  console.log(await git.listRemotes({ fs, dir: '/' }));
};

const revertChanges = async (url: string) => {
  const { specTree, mapTrees } = await hydrate(url);
  saveSpecificationTree(specTree, undefined, {}, url);
  saveExampleMapTrees(mapTrees, undefined, {}, url);
};

const addCommit = async (url: string, message: string, config: GitConfig) => {
  const specState = fetchLocalSpecState(url);
  const mapState = fetchLocalMapState(url);
  await addChanges(specState, mapState, url);
  await commitChanges(url, message, config);
  // reset the local touched state
  saveSpecificationTree(specState.tree, undefined, {}, url);
  saveExampleMapTrees(mapState.trees, undefined, {}, url);
};

const addChanges = async (
  specState: SpecTreeState,
  mapState: MapTreesState,
  url: string
) => {
  if (!specState.tree) {
    return;
  }
  await writeTreeMetadata(specState.tree, 'specification.yml', url);
  if (mapState.trees) {
    await writeTreeDocuments(specState.tree, mapState.trees, url);
  }
  await writeFeatureToggles(specState.tree, url);
  await addFiles(url);
  await removeRenamedFiles(specState, mapState, url);
};

const removeRenamedFiles = async (
  specState: SpecTreeState,
  mapState: MapTreesState,
  url: string
) => {
  const fs = await initFS(url);
  const promises = [];
  if (specState.renameKeys) {
    for (const key of Object.keys(specState.renameKeys)) {
      promises.push(removeFileIfExists(`${key}.md`, url, fs));
      promises.push(removeFileIfExists(`map-${key}.yml`, url, fs));
      promises.push(removeFileIfExists(`${key}.feature`, url, fs));
    }
  }
  if (mapState.renameKeys) {
    for (const key of Object.keys(mapState.renameKeys)) {
      promises.push(removeFileIfExists(`${key}.md`, url, fs));
    }
  }
  await Promise.all(promises);
};

const removeFileIfExists = async (
  file: string,
  url: string,
  fs: PromiseFsClient
): Promise<void> => {
  try {
    await fs.promises.stat(`/${file}`);
    await fs.promises.unlink(`/${file}`);
    await git.remove({ fs, dir: '/', filepath: `${file}` });
  } catch (e) {}
};

const addFiles = async (url: string): Promise<void> => {
  const fs = await initFS(url);
  try {
    await fs.promises.stat(`/files`);
    try {
      const files = await fs.promises.readdir('/files');
      for (const file of files) {
        if (file === '.git') {
          continue;
        }
        await git.add({ fs, dir: '/', filepath: 'files/' + file });
      }
    } catch (e2) {
      console.error(e2);
    }
  } catch (e) {}
};

const commitChanges = async (
  url: string,
  message: string,
  config: GitConfig
): Promise<void> => {
  const fs = await initFS(url);
  const gitProfile = lookupCurrentProfile(url, config);

  let commit: any = {
    fs,
    onSign: pgp.sign,
    dir: '/',
    author: {
      name: gitProfile['author-name'],
      email: gitProfile['author-email']
    },
    message
  };

  if (
    gitProfile['pgp-private-key'] &&
    gitProfile['pgp-private-key'].trim().length > 0
  ) {
    commit['signingKey'] = gitProfile['pgp-private-key'].trim();
  }
  const sha = await git.commit(commit);

  console.log(`commit SHA: ${sha}`);
};

const pushBranch = async (url: string, config: GitConfig): Promise<void> => {
  const fs = await initFS(url);
  const gitProfile = lookupCurrentProfile(url, config);
  let pushResult = await git.push({
    fs,
    http,
    dir: '/',
    remote: gitProfile['remote-name'],
    corsProxy: gitProfile['cors-proxy-address'],
    ref: lookupCurrentBranch(url, config),
    onAuth: () => getAuth(gitProfile)
  });
  console.log('push result', pushResult);
};

const getAuth = (gitProfile: GitProfile): Auth => {
  const auth: Auth = {
    username: gitProfile['username']
  };
  if (gitProfile['password']) {
    auth['password'] = gitProfile['password'];
  }
  return auth;
};

const hydrate = async (
  url: string
): Promise<{
  specTree: SpecNode[];
  mapTrees: { [key: string]: MapTreeState };
}> => {
  const specTree = await hydrateSpecificationTree(url);
  const mapTrees = await hydrateExampleMapTrees(specTree, url);
  return { specTree, mapTrees };
};

const hydrateSpecificationTree = async (url: string): Promise<SpecNode[]> => {
  const fs = await initFS(url);
  const tree: SpecNode[] = await readSpecTreeMetadata('specification.yml', url);
  const treeNodes = getTreeNodesAsArray(tree) as SpecNode[];

  // load the documents into the tree
  for (const specNode of treeNodes) {
    try {
      const filename = `/${specNode.key}.md`;
      await fs.promises.stat(filename);
      specNode.notes = await fs.promises.readFile(filename, {
        encoding: 'utf8'
      });
    } catch (e) {
      // note: lightning-fs doesn't have exists(), so using this method instead.
    }
    if (specNode.type === 'feature') {
      try {
        const filename = `/${specNode.key}.feature`;
        await fs.promises.stat(filename);
        specNode.gherkin = await fs.promises.readFile(filename, {
          encoding: 'utf8'
        });
      } catch (e) {}
    }
  }

  // then, set the feature toggles
  try {
    const filename = `/feature-toggles.yml`;
    await fs.promises.stat(filename);
    const toggles = deserialize(
      await fs.promises.readFile(filename, { encoding: 'utf8' })
    );
    for (const specNode of treeNodes) {
      if (toggles[specNode.key]) {
        const toggle = toggles[specNode.key];
        specNode.toggleState = toggle.state;
        specNode.conditions = toggle.conditions;
      }
    }
  } catch (e) {}

  return tree;
};

const hydrateExampleMapTrees = async (
  specTree: SpecNode[],
  url: string
): Promise<{ [key: string]: MapTreeState }> => {
  const fs = await initFS(url);
  const specTreeNodes = getTreeNodesAsArray(specTree);
  const mapTrees: { [key: string]: MapTreeState } = {};
  const mapTreeKeys: string[] = [];

  specTreeNodes.forEach((specNode: SpecNode) => {
    if (specNode.type === 'map') {
      mapTreeKeys.push(specNode.key);
    }
  });

  for (const mapKey of mapTreeKeys) {
    try {
      const filename = `/map-${mapKey}.yml`;
      await fs.promises.stat(filename);
      const mapTree: MapNode[] = deserialize(
        await fs.promises.readFile(filename, { encoding: 'utf8' })
      );
      const mapTreeNodes: MapNode[] = getTreeNodesAsArray(mapTree);
      for (const mapNode of mapTreeNodes) {
        try {
          const filename = `/${mapNode.key}.md`;
          await fs.promises.stat(filename);
          mapNode.notes = await fs.promises.readFile(filename, {
            encoding: 'utf8'
          });
        } catch (e) {}
      }
      mapTrees[mapKey] = {
        tree: mapTree,
        selectedTreeIndex: 0,
        selectedNodeKey: undefined
      };
    } catch (e) {}
  }

  return mapTrees;
};

const readSpecTreeMetadata = async (
  filename: string,
  url: string
): Promise<SpecNode[]> => {
  const fs = await initFS(url);
  const content: string = await fs.promises.readFile(`/${filename}`, {
    encoding: 'utf8'
  });
  return deserialize(content);
};

const writeTreeMetadata = async (
  tree: SpecNode[] | MapNode[],
  filename: string,
  url: string
): Promise<void> => {
  const fs = await initFS(url);
  const metadata = immutableTreeKeyFilter(
    ['key', 'type', 'title', 'expanded', 'tags'],
    tree
  );
  await fs.promises.writeFile(`/${filename}`, serialize(metadata));
  await git.add({ fs, dir: '/', filepath: filename });
};

const writeTreeDocuments = async (
  specTree: SpecNode[],
  mapTrees: { [key: string]: MapTreeState },
  url: string
) => {
  const specTreeNodes = getTreeNodesAsArray(specTree);

  const promises: any = [];
  specTreeNodes.forEach((specNode: SpecNode) => {
    promises.push(writeTreeNodeDocuments(specNode, url));
    if (specNode.type === 'map') {
      const mapTree = mapTrees[specNode.key].tree;
      promises.push(writeTreeMetadata(mapTree, `map-${specNode.key}.yml`, url));
      const mapTreeNodes = getTreeNodesAsArray(mapTree);
      mapTreeNodes.forEach((mapNode: MapNode) => {
        promises.push(writeTreeNodeDocuments(mapNode, url));
      });
    }
  });

  await Promise.all(promises);
};

const writeTreeNodeDocuments = async (
  node: SpecNode | MapNode,
  url: string
) => {
  const fs = await initFS(url);
  if (node.notes) {
    await fs.promises.writeFile(`/${node.key}.md`, node.notes);
    await git.add({ fs, dir: '/', filepath: `${node.key}.md` });
  } else {
    try {
      await fs.promises.stat(`/${node.key}.md`);
      await fs.promises.unlink(`/${node.key}.md`);
      await git.remove({ fs, dir: '/', filepath: `${node.key}.md` });
    } catch (e) {}
  }
  if ('gherkin' in node && node.gherkin) {
    await fs.promises.writeFile(`/${node.key}.feature`, node.gherkin);
    await git.add({ fs, dir: '/', filepath: `${node.key}.feature` });
  } else {
    try {
      await fs.promises.stat(`/${node.key}.feature`);
      await fs.promises.unlink(`/${node.key}.feature`);
      await git.remove({ fs, dir: '/', filepath: `${node.key}.feature` });
    } catch (e) {}
  }
};

const serialize = (obj: any) => {
  return YAML.stringify(obj);
};

const deserialize = (yaml: string) => {
  return YAML.parse(yaml);
};

const writeFeatureToggles = async (tree: SpecNode[], url: string) => {
  const fs = await initFS(url);
  const toggles: FeatureToggles = immutableFeatureToggles(tree);
  if (Object.keys(toggles).length > 0) {
    await fs.promises.writeFile('/feature-toggles.yml', serialize(toggles));
    await git.add({ fs, dir: '/', filepath: 'feature-toggles.yml' });
  } else {
    // remove if there is nothing
    try {
      await fs.promises.stat('/feature-toggles.yml');
      await fs.promises.unlink('/feature-toggles.yml');
      await git.remove({ fs, dir: '/', filepath: 'feature-toggles.yml' });
    } catch (e) {}
  }
};

export {
  fetchLocalConfigState,
  fetchLocalMapState,
  fetchLocalSpecState,
  saveExampleMapTrees,
  saveSpecificationTree,
  cloneRepo,
  listFilesInRepo,
  deleteFileFromRepo,
  uploadFileToRepo,
  downloadLocalRepository,
  fetchFileAsBlob,
  isFileInRepository,
  deleteLocalRepository,
  initRepo,
  hydrate,
  addCommit,
  pushBranch,
  revertChanges,
  changeRemotes,
  persistState
};
