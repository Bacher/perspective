import http from 'http';
import WebSocket from 'ws';

import Connection from './Connection';

export default class WebSocketServer {
  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', ws => {
      new Connection(ws);
    });
  }

  listen(port) {
    return new Promise((resolve, reject) => {
      this.server.listen(port, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
