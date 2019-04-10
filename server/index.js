import mongoose from 'mongoose';

import WebSocketServer from './src/WebSocketServer';
import './src/db';

const PORT = 8080;

setTimeout(async () => {
  await mongoose.connect('mongodb://localhost/perspective', {
    useNewUrlParser: true,
  });

  const server = new WebSocketServer();
  server.listen(PORT).then(
    () => {
      console.log(`WebSocket server started at port ${PORT}`);
    },
    err => {
      console.error(err);
      process.exit(1);
    }
  );
}, 0);
