import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/AppContainer';
import { Buffer } from 'buffer';

//@ts-ignore
window.Buffer = Buffer;

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
