import gameState from '../gameState';

let instance = null;

export default class Client {
  constructor() {
    instance = this;

    this.lastId = 0;
    this.lastActionId = 0;

    this.waits = new Map();
    this.actionWaits = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${window.location.hostname}:8080`);

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
        if (params.actionsResults) {
          this.processActionsResults(params.actionsResults);
        }

        gameState.updateWorld(params);
        break;
      default:
        throw new Error(`Invalid method [${methodName}]`);
    }
  }

  processActionsResults(actionsResults) {
    for (const action of actionsResults.cancel) {
      const actionInfo = this.actionWaits.get(action.id);

      if (actionInfo) {
        actionInfo.reject(new Error('Canceled'));
      }
    }

    for (const action of actionsResults.done) {
      const actionInfo = this.actionWaits.get(action.id);

      if (actionInfo) {
        actionInfo.resolve(action.result);
      }
    }
  }

  action(methodName, params) {
    return new Promise((resolve, reject) => {
      const actionId = ++this.lastActionId;

      const actionInfo = {
        resolve,
        reject,
        timeoutId: null,
      };

      this.actionWaits.set(actionId, actionInfo);

      actionInfo.timeoutId = setTimeout(() => {
        this.actionWaits.delete(actionId);
        reject(new Error('Timeout Error'));
      }, 5000);

      this.send(methodName, {
        ...params,
        actionId,
      });
    });
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
