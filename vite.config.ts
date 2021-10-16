import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs';

const defaultVirtualFileId = '@virtual:plain-text/';

const plainText = (virtualFileId = defaultVirtualFileId) => {
  return {
    name: 'virtual-plain-text', // required, will show up in warnings and errors
    resolveId(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        return id;
      }
    },
    async load(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        const filePath = path.resolve(id.replace(virtualFileId, ''));
        const content = await fs.promises.readFile(filePath, {
          encoding: 'utf-8'
        });
        return `export const plainText = ${JSON.stringify(content)}`;
      }
    }
  };
};

const resolveFixup = {
  name: 'resolve-fixup',
  setup(build) {
    build.onResolve({ filter: /react-virtualized/ }, async (args) => {
      return {
        path: path.resolve(
          './node_modules/react-virtualized/dist/umd/react-virtualized.js'
        )
      };
    });
    build.onResolve({ filter: /idb-keyval/ }, async (args) => {
      return {
        path: path.resolve(
          './node_modules/@isomorphic-git/idb-keyval/idb-keyval.ts'
        )
      };
    });
    build.onResolve({ filter: /pgp-plugin/ }, async (args) => {
      return {
        path: path.resolve(
          './node_modules/@isomorphic-git/pgp-plugin/src/index.js'
        )
      };
    });
    build.onResolve({ filter: /lightning-fs/ }, async (args) => {
      return {
        path: path.resolve(
          './node_modules/@isomorphic-git/lightning-fs/src/index.js'
        )
      };
    });
    build.onResolve({ filter: /^isomorphic-git$/ }, async (args) => {
      return {
        path: path.resolve('./node_modules/isomorphic-git/index.js')
      };
    });
    build.onResolve({ filter: /isomorphic-git\/http\/web/ }, async (args) => {
      return {
        path: path.resolve('./node_modules/isomorphic-git/http/web/index.js')
      };
    });
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      buffer: 'buffer'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [resolveFixup]
    },
    include: [
      'gherkin-testkit',
      'react-hook-thunk-reducer',
      'chai',
      'isomorphic-git',
      '@isomorphic-git/lightning-fs',
      '@isomorphic-git/pgp-plugin',
      'isomorphic-git/http/web/index.js',
      '@testing-library/react',
      '@testing-library/react/dont-cleanup-after-each'
    ],
    exclude: ['/__web-dev-server__web-socket.js']
  },
  plugins: [process.env.NODE_ENV !== 'test' ? react() : plainText()],
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())]
    }
  }
});
