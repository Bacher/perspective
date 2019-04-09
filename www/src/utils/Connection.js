export default class Connection {
  constructor() {
    this.lastId = 0;

    this.waits = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket('ws://localhost:8080');

      this.socket.addEventListener('open', () => {
        resolve();
      });

      this.socket.addEventListener('error', err => {
        reject(err);
      });

      this.socket.addEventListener('message', this.onMessage);
    });
  }

  send(data) {
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        ...data,
      })
    );
  }

  onMessage = e => {
    const data = JSON.parse(e.data);

    if (data.method) {
      // call processing
      return;
    }

    const wait = this.waits.get(data.id);

    if (!wait) {
      return;
    }

    if (data.error) {
      wait.reject(data.error);
    } else {
      wait.resolve(data.result);
    }
  };

  request(methodName, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.lastId;

      this.waits.set(id, { resolve, reject });

      this.socket.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: methodName,
          params,
        })
      );
    });
  }
}
