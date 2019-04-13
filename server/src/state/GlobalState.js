import ChunkState, { formatObject } from './ChunkState';
import { db } from '../Mongo';
import { positionToChunkId, getAroundChunks } from '../utils/chunks';

// const TICK_INTERVAL = 33;
const TICK_INTERVAL = 333;

let instance = null;

export default class GlobalState {
  constructor() {
    instance = this;
    this.chunks = new Map();
    this.playerClients = new Map();
    this._getStateRequests = [];
  }

  async init() {
    this.startTick();
  }

  disconnectPlayerClient(playerClient) {
    this.playerClients.delete(playerClient);
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
    const player = await db().players.findOne({
      username: playerClient.username,
    });

    let playerObject;

    if (!player) {
      const position = {
        x: 700,
        y: 700,
      };

      playerObject = {
        type: 'player',
        position,
        chunkId: positionToChunkId(position),
      };

      await db().gameObjects.insertOne(playerObject);

      playerObject.id = playerObject._id.toString();

      await db().players.insertOne({
        username: playerClient.username,
        gameObjectId: playerObject.id,
      });
    } else {
      playerObject = await db().gameObjects.findOne({
        _id: player.gameObjectId,
      });

      playerObject.id = playerObject._id.toString();
    }

    const playerId = playerObject.id;
    const chunkId = playerObject.chunkId;

    playerClient.id = playerId;

    playerClient.lastPosition = playerObject.position;

    playerClient.chunkId = chunkId;
    playerClient.chunksIds = getAroundChunks(playerClient.chunkId, 2);

    this.playerClients.set(playerClient.id, playerClient);

    const chunks = [];

    await Promise.all(
      playerClient.chunksIds.map(async chunkId => {
        const chunk = await this.getChunk(chunkId);

        chunks.push({
          chunkId,
          gameObjects: chunk.getObjectsExceptMeJSON(playerId),
        });
      })
    );

    return {
      playerId: playerId,
      chunkId: playerClient.chunkId,
      chunksIds: playerClient.chunksIds,
      position: playerObject.position,
      chunks,
    };
  }

  startTick = async () => {
    const start = Date.now();

    await this.tick();

    const remains = Math.max(0, TICK_INTERVAL - (Date.now() - start));

    setTimeout(this.startTick, remains);
  };

  async tick() {
    for (const playerClient of this.playerClients.values()) {
      const chunk = this.chunks.get(playerClient.chunkId);

      const playerObject = chunk.gameObjects.get(playerClient.id);

      const { x, y } = playerObject.position;

      await chunk.updatePosition(playerObject, {
        x: x + 2,
        y: y + 1,
      });

      // Если изменилась позиция обхекта игрока, то надо пересчитать чанки в playerClient
      playerClient.chunkId = playerObject.chunkId;
      playerClient.chunksIds = getAroundChunks(playerObject.chunkId, 2);

      for (const chunkId of playerClient.chunksIds) {
        await this.getChunk(chunkId);
      }
    }

    await this.sendUpdates();
    await this.saveChanges();
    await this.handleGetStateRequests();
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

    this._getStateRequests = [];
  }

  async sendUpdates() {
    for (const playerClient of this.playerClients.values()) {
      const chunks = {};
      let hasUpdatedChunks = false;
      let position = null;

      // TODO: Когда добавляется chunkId в playerClient.chunksIds нужно отдавать в этот момент полный слепок чанка
      for (const chunkId of playerClient.chunksIds) {
        const chunk = this.getChunkIfLoaded(chunkId);

        const chunkDiff = {
          updated: [],
          removed: [],
        };

        let hasChanges = false;

        for (const obj of chunk.updatedObjects) {
          if (obj.id === playerClient.id) {
            position = obj.position;
          } else {
            chunkDiff.updated.push(formatObject(obj));
            hasChanges = true;
          }
        }

        for (const obj of chunk.removedObjects) {
          chunkDiff.removed.push(obj.id);
          hasChanges = true;
        }

        if (hasChanges) {
          chunks[chunkId] = chunkDiff;
          hasUpdatedChunks = true;
        }
      }

      const { x, y } = playerClient.lastPosition;

      if (
        !hasUpdatedChunks &&
        (!position || (position.x === x && position.y === y))
      ) {
        return;
      }

      playerClient.lastPosition = {
        x: position.x,
        y: position.y,
      };

      playerClient
        .send('worldUpdates', {
          position,
          chunksIds: playerClient.chunksIds,
          chunks,
        })
        .catch(err => {
          console.error('Send event failed:', err);
        });
    }
  }

  async saveChanges() {
    for (const chunk of this.chunks.values()) {
      if (chunk.hasChanges) {
        await chunk.saveChanges();
      }
    }
  }

  async loadChunk(id) {
    const chunk = new ChunkState(this, id);

    this.chunks.set(id, chunk);

    await chunk.load();

    return chunk;
  }

  getChunkIfLoaded(id) {
    return this.chunks.get(id) || null;
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
