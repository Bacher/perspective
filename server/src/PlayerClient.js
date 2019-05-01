import { getGlobalState } from './state/GlobalState';

const ACTION_METHODS = [
  'moveTo',
  'createBuildingFrame',
  'putResources',
  'startBuild',
];

export default class PlayerClient {
  constructor(connection, { username }) {
    this.con = connection;
    this.id = null;
    this.username = username;
    this.chunkId = null;
    this.chunksIds = null;
    this.lastPosition = null;
    this.action = null;
    this.newChunks = new Set();

    this.globalState = getGlobalState();
  }

  async handleRequest(methodName, params) {
    if (ACTION_METHODS.includes(methodName)) {
      this.action = {
        type: methodName,
        params,
      };
      return;
    }

    switch (methodName) {
      case 'getCurrentState':
        return this.globalState.getPlayerStateSnapshot(this);
      case 'chatMessage':
        this.globalState.updateTextFrom(this, params.text);
        return;
      case 'transformToBuild':
        this.globalState.transformToBuild(this, params);
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
