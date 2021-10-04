import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

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
    }
  },
  plugins: [react()]
});
