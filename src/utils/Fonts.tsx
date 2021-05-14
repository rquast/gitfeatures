import React from 'react';
import * as inter from './inter.css';
import * as cascadia from './cascadia.css';
import { Global } from '@emotion/react';

const Fonts = () => <Global styles={{ ...inter, ...cascadia }} />;

export default Fonts;
