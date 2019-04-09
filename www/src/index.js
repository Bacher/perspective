import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';

import './index.scss';
import App from './components/App';

setTimeout(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
}, 0);
