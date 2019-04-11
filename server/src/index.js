import mongoose from 'mongoose';

import WebSocketServer from './WebSocketServer';
import GlobalState from './state/GlobalState';
import { generateObjects } from './generation/generation';
import './db';

const PORT = 8080;

setTimeout(async () => {
  try {
    await mongoose.connect('mongodb://localhost/perspective', {
      useNewUrlParser: true,
    });

    // await generateObjects();

    const globalState = new GlobalState();
    await globalState.init();

    const server = new WebSocketServer();

    await server.listen(PORT);

    console.log(`WebSocket server started at port ${PORT}`);
  } catch (err) {
    console.error('Initializing failed:', err);
    process.exit(1);
  }
}, 0);
