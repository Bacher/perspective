import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';

import './index.scss';
import App from './components/App';
import Client from './utils/Client';

setTimeout(async () => {
  const client = new Client();

  await client.connect();

  await client.request('authorize', {
    username: 'John',
  });

  const state = await client.request('getCurrentState');

  console.log('state:', state);

  ReactDOM.render(<App />, document.getElementById('root'));
}, 0);
