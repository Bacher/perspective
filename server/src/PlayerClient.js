import { getGlobalState } from './state/GlobalState';

export default class PlayerClient {
  constructor(connection, { username }) {
    this.con = connection;
    this.id = null;
    this.username = username;
    this.chunkId = null;
    this.chunksIds = null;
    this.lastPosition = null;
    this.moveTo = null;
    this.newChunks = new Set();

    this.globalState = getGlobalState();
  }

  async handleRequest(methodName, params) {
    switch (methodName) {
      case 'getCurrentState':
        return this.globalState.getPlayerStateSnapshot(this);
      case 'moveTo':
        this.moveTo = params.position;
        return;
      case 'createBuildingFrame':
        // TODO: Возможно тут стоит дождаться синхронизации тиков с GlobalState
        this.action = {
          type: 'createBuildingFrame',
          building: params.building,
          position: params.position,
        };
        return;
      case 'chatMessage':
        this.globalState.updateTextFrom(this, params.text);
        return;
      default:
        throw new Error('Invalid method name');
    }
  }

  async send(methodName, data) {
    await this.con.send({
      method: methodName,
      params: data,
    });
  }

  disconnect() {
    this.con = null;
    this.globalState.disconnectPlayerClient(this);
  }
}
