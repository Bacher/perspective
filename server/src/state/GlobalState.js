import ChunkState from './ChunkState';
import { Player, GameObject } from '../db';

const PLAYER_ID = '5caf90ebdf8e815109257d4b';
// const TICK_INTERVAL = 33;
const TICK_INTERVAL = 333;

let instance = null;

export default class GlobalState {
  constructor() {
    instance = this;
    this.chunks = new Map();
    this.players = new Set();
    this._getStateRequests = [];
  }

  async init() {
    this.startTick();
  }

  connectPlayerClient(playerClient) {
    this.players.add(playerClient);
  }

  disconnectPlayerClient(playerClient) {
    this.players.delete(playerClient);
  }

  async getPlayerStateSnapshot(playerClient) {
    return new Promise(resolve => {
      this._getStateRequests.push({
        playerClient,
        resolve,
      });
    });
  }

  async _getPlayerStateSnapshot(playerClient) {
    const player = await Player.findOne({
      username: playerClient.username,
    });

    let playerObject;

    if (!player) {
      playerObject = await new GameObject({
        type: 'player',
        position: {
          x: 0,
          y: 0,
        },
        chunkId: 0,
      }).save();

      await new Player({
        username: playerClient.username,
        gameObjectId: playerObject._id,
      }).save();
    } else {
      playerObject = await GameObject.findOne({
        _id: player.gameObjectId,
      });
    }

    const playerId = playerObject._id.toString();
    const chunkId = playerObject.chunkId;

    const chunk = await this.getChunk(chunkId);

    playerClient.id = playerId;
    playerClient.inGame = true;

    playerClient.lastPosition = playerObject.position;

    return {
      playerId: playerId,
      chunksIds: playerClient.chunksIds,
      position: playerObject.position,
      chunks: [
        {
          chunkId,
          gameObjects: chunk.getObjectsExceptMeJSON(playerId),
        },
      ],
    };
  }

  startTick = async () => {
    const start = Date.now();

    await this.tick();

    const remains = Math.max(0, TICK_INTERVAL - (Date.now() - start));

    setTimeout(this.startTick, remains);
  };

  async tick() {
    await this.handleGetStateRequests();

    this.updatedObjects = new Set();

    const chunk = this.chunks.get(0);

    if (chunk) {
      const player = chunk.gameObjects.get(PLAYER_ID);

      const { x, y } = player.position;

      player.position = {
        x: x + 0.5,
        y: y + 0.1,
      };

      this.updatedObjects.add(player);
    }

    await Promise.all([this.sendUpdates(), this.saveChanges()]);
  }

  async handleGetStateRequests() {
    if (this._getStateRequests.length === 0) {
      return;
    }

    await Promise.all(
      this._getStateRequests.map(({ playerClient, resolve }) => {
        const promise = this._getPlayerStateSnapshot(playerClient);
        resolve(promise);
        return promise;
      })
    );
  }

  async sendUpdates() {
    const players = Array.from(this.players.values());

    await Promise.all(
      players.map(async playerClient => {
        if (!playerClient.inGame) {
          return;
        }

        const updates = [];
        let position = null;

        for (const obj of this.updatedObjects) {
          if (obj._id.toString() === playerClient.id) {
            position = obj.position;
          } else if (playerClient.chunksIds.includes(obj.chunkId)) {
            updates.push(obj);
          }
        }

        const { x, y } = playerClient.lastPosition;

        if (updates.length === 0 && position.x === x && position.y === y) {
          return;
        }

        playerClient.lastPosition = position;

        try {
          await playerClient.send('worldUpdates', {
            position,
            chunksIds: playerClient.chunksIds,
            updates,
          });
        } catch (err) {
          console.error('Send event failed:', err);
        }
      })
    );
  }

  async saveChanges() {
    for (const object of this.updatedObjects) {
      await object.save();
    }
  }

  async loadChunk(id) {
    const chunk = new ChunkState(id);

    this.chunks.set(id, chunk);

    await chunk.load();

    return chunk;
  }

  async getChunk(id) {
    let chunk = this.chunks.get(id);

    if (!chunk) {
      chunk = await this.loadChunk(id);
    } else if (chunk.loading) {
      await chunk.loading;
    }

    return chunk;
  }
}

export function getGlobalState() {
  return instance;
}
