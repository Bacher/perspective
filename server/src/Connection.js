export default class Connection {
  constructor(ws) {
    this.ws = ws;
    this.authorized = false;

    this.ws.on('message', this.onMessage);
  }

  onMessage = async json => {
    const data = JSON.parse(json);

    let result;
    let error;

    try {
      result = (await this.request(data.method, data.params)) || {};
    } catch (err) {
      error = err;
    }

    this.ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: data.id,
        error,
        result,
      })
    );
  };

  async request(methodName, params) {
    if (!this.authorized) {
      if (methodName === 'authorize') {
        this.authorized = true;
        this.username = params.username;
        return;
      }

      throw new Error('Unauthorized');
    }

    return {
      what: 'who?',
    };
  }
}
