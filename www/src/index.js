import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';

import './index.scss';
import state from './state';
import App from './components/App';
import Client from './utils/Client';

setTimeout(async () => {
  const client = new Client();

  await client.connect();

  await client.request('authorize', {
    username: 'John',
  });

  const gameState = await client.request('getCurrentState');

  console.log('gameState:', gameState);

  ReactDOM.render(<App client={client} />, document.getElementById('root'));

  state.applyGameState(gameState);
}, 0);
