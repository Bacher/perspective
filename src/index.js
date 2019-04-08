import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import './index.css';

setTimeout(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
}, 0);
