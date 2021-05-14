module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  packageOptions: {
    polyfillNode: true
  },
  buildOptions: {
    sourcemap: true,
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    ['@snowpack/plugin-run-script', {cmd: 'tsc --noEmit', watch: '$1 --watch'}],
  ],
};
