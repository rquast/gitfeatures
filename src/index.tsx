import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/AppContainer';

const root = document.getElementById('root');
if (root) {
  // Required for flexbox layout
  root.style.height = '100%';
}

ReactDOM.render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>,
  root
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
