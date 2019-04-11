import RequestError from './RequestError';
import PlayerClient from './PlayerClient';

export default class Connection {
  constructor(ws) {
    this.ws = ws;
    this.authorized = false;

    this.waits = new Map();
    this.lastId = 0;

    this.ws.on('message', this.onMessage);
    this.ws.on('close', this.onClose);
  }

  onMessage = async json => {
    const data = JSON.parse(json);

    if (data.method) {
      const { id, method, params } = data;

      let result;

      try {
        result = (await this.handleRequest(method, params)) || {};
      } catch (err) {
        let message;

        if (err instanceof RequestError) {
          message = err.message;
        } else {
          console.error('Request handler failed:', err);
          message = 'Internal Server Error';
        }

        if (id) {
          this.send({
            id,
            error: {
              method,
              message,
            },
          });
        }
        return;
      }

      if (id) {
        this.send({
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

  onClose = () => {
    if (this.playerClient) {
      this.playerClient.disconnect();
    }
  };

  async request(methodName, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.lastId;

      this.waits.set(id, { resolve, reject });

      this.send({
        id,
        method: methodName,
        params,
      });
    });
  }

  async handleRequest(methodName, params) {
    if (!this.authorized) {
      if (methodName === 'authorize') {
        this.authorized = true;
        this.username = params.username;

        this.playerClient = new PlayerClient(this, params);
        return;
      }

      throw new Error('Unauthorized');
    }

    return await this.playerClient.handleRequest(methodName, params);
  }

  send(data) {
    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        ...data,
      })
    );
  }
}
