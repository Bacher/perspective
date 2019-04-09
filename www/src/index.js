import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';

import './index.scss';
import App from './components/App';
import Connection from './utils/Connection';

setTimeout(() => {
  const socket = new Connection();

  socket.connect().then(() => {
    socket.request('authorize', {
      username: 'John',
    });
  });

  ReactDOM.render(<App />, document.getElementById('root'));
}, 0);
