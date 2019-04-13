import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';

import './index.scss';
import state from './state';
import App from './components/App';
import Client from './utils/Client';
import { parseSearchQuery } from './utils/querystring';

setTimeout(async () => {
  const client = new Client();

  await client.connect();

  const params = parseSearchQuery();

  await client.request('authorize', {
    username: params.username || 'John',
  });

  const gameState = await client.request('getCurrentState');

  console.log('gameState:', gameState);

  ReactDOM.render(<App />, document.getElementById('root'));

  state.applyGameState(gameState);
}, 0);
