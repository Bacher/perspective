import gameState from '../gameState';

let instance = null;

export default class Client {
  constructor() {
    instance = this;

    this.lastId = 0;

    this.waits = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:8080');

      this.ws.addEventListener('open', () => {
        resolve();
      });

      this.ws.addEventListener('error', err => {
        reject(err);
      });

      this.ws.addEventListener('message', this.onMessage);
    });
  }

  onMessage = async e => {
    const data = JSON.parse(e.data);

    if (data.method) {
      const { id, method, params } = data;

      let result;

      try {
        result = (await this.handleRequest(method, params)) || {};
      } catch (err) {
        console.error(err);

        if (id) {
          this._send({
            id,
            error: {
              ...err,
              message: err.message,
            },
          });
        }
        return;
      }

      if (id) {
        this._send({
          id,
          result,
        });
      }

      return;
    }

    const wait = this.waits.get(data.id);

    if (wait) {
      if (data.error) {
        wait.reject(data.error);
      } else {
        wait.resolve(data.result);
      }
    }
  };

  request(methodName, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.lastId;

      this.waits.set(id, { resolve, reject });

      this._send({
        id,
        method: methodName,
        params,
      });
    });
  }

  send(methodName, params) {
    this._send({
      method: methodName,
      params,
    });
  }

  handleRequest(methodName, params) {
    switch (methodName) {
      case 'worldUpdates':
        gameState.updateWorld(params);
        break;
      default:
        throw new Error(`Invalid method [${methodName}]`);
    }
  }

  _send(data) {
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        ...data,
      })
    );
  }
}

export function client() {
  return instance;
}
