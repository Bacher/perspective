import { getGlobalState } from './state/GlobalState';

export default class PlayerClient {
  constructor(connection, { username }) {
    this.con = connection;
    this.id = null;
    this.username = username;
    this.chunksIds = [0];
    this.globalState = getGlobalState();
    this.globalState.connectPlayerClient(this);
  }

  async handleRequest(methodName, params) {
    switch (methodName) {
      case 'getCurrentState':
        return this.globalState.getPlayerStateSnapshot(this);
      default:
        throw new Error('Invalid method name');
    }
  }

  async send(data) {
    await this.con.send({
      a: data,
    });
  }
}
