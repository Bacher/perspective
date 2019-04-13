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
    this.needSave = new Set();

    this.lastTick = 0;
  }

  async init() {
    this.startTick();
  }

  disconnectPlayerClient(playerClient) {
    this.playerClients.delete(playerClient.id);
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
    const tickId = ++this.lastTick;

    const time = (tickId * TICK_INTERVAL) / 1000;

    await this.tick(tickId, time);

    const remains = Math.max(0, TICK_INTERVAL - (Date.now() - start));

    setTimeout(this.startTick, remains);
  };

  async tick(tickId, time) {
    // for (const playerClient of this.playerClients.values()) {
    //   const chunk = this.chunks.get(playerClient.chunkId);
    //
    //   const playerObject = chunk.gameObjects.get(playerClient.id);
    //
    //   const { x, y } = playerObject.position;
    //
    //   await chunk.updatePosition(playerObject, {
    //     x: x + 2,
    //     y: y + 1,
    //   });
    //
    //   // Если изменилась позиция обхекта игрока, то надо пересчитать чанки в playerClient
    //   playerClient.chunkId = playerObject.chunkId;
    //   playerClient.chunksIds = getAroundChunks(playerObject.chunkId, 2);
    //
    //   for (const chunkId of playerClient.chunksIds) {
    //     await this.getChunk(chunkId);
    //   }
    // }

    const pig = await db().gameObjects.findOne({ type: 'pig' });
    pig.id = pig._id.toString();

    const chunk = this.chunks.get(pig.chunkId);

    if (chunk) {
      const position = {
        x: Math.round(730 + 50 * Math.cos(time)),
        y: Math.round(650 + 50 * Math.sin(time)),
      };

      await chunk.updatePosition(pig, position);
    }

    this.sendUpdates();
    this.tickCleanUp();
    await this.saveObjects();
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

  sendUpdates() {
    for (const playerClient of this.playerClients.values()) {
      const updatedChunks = {};
      let hasUpdatedChunks = false;
      let position = null;

      // TODO: Когда добавляется chunkId в playerClient.chunksIds нужно отдавать
      // в этот момент полный слепок чанка
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
          updatedChunks[chunkId] = chunkDiff;
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

      if (position) {
        playerClient.lastPosition = {
          x: position.x,
          y: position.y,
        };
      }

      playerClient
        .send('worldUpdates', {
          position: playerClient.lastPosition,
          chunksIds: playerClient.chunksIds,
          updatedChunks,
        })
        .catch(err => {
          console.error('Send event failed:', err);
        });
    }
  }

  tickCleanUp() {
    for (const chunk of this.chunks.values()) {
      chunk.tickCleanUp();
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

  markObjectAsUpdated(obj) {
    this.needSave.add(obj);
  }

  async saveObjects() {
    await Promise.all(
      Array.from(this.needSave).map(obj =>
        db().gameObjects.updateOne(
          { _id: obj._id },
          {
            $set: {
              chunkId: obj.chunkId,
              position: obj.position,
            },
          }
        )
      )
    );

    this.needSave = new Set();
  }
}

export function getGlobalState() {
  return instance;
}
