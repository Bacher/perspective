import ChunkState, { formatObject } from './ChunkState';
import { db } from '../Mongo';
import { positionToChunkId, getAroundChunks } from '../utils/chunks';
import generateId from '../utils/generateId';

const TICK_INTERVAL = 333;

const BASE_PLAYER_SPEED = 20;

let instance = null;

export default class GlobalState {
  constructor() {
    instance = this;
    this.time = 0;
    this.chunks = new Map();
    this.playerClients = new Map();
    this._getStateRequests = [];
    this.newObjects = new Set();
    this.needSave = new Set();
    this.tickActions = [];
    this.lastGeneratedIndex = 0;

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
        id: generateId(),
        type: 'player',
        position,
        playerName: playerClient.username,
        chunkId: positionToChunkId(position),
      };

      await db().gameObjects.insertOne(playerObject);

      const chunk = this.getChunkIfLoaded(playerObject.chunkId);

      if (chunk) {
        chunk.addObject(playerObject);
      }

      await db().players.insertOne({
        username: playerClient.username,
        gameObjectId: playerObject.id,
      });
    } else {
      playerObject = await db().gameObjects.findOne({
        id: player.gameObjectId,
      });
    }

    const playerId = playerObject.id;
    const chunkId = playerObject.chunkId;

    playerClient.id = playerId;

    playerClient.lastPosition = playerObject.position;

    playerClient.chunkId = chunkId;
    playerClient.chunksIds = getAroundChunks(playerClient.chunkId);

    this.playerClients.set(playerClient.id, playerClient);

    const chunks = [];

    await Promise.all(
      playerClient.chunksIds.map(async chunkId => {
        const chunk = await this.getChunk(chunkId);

        chunks.push({
          id: chunkId,
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

    const delta = time - this.time;
    this.time = time;

    await this.tick({ tickId, time, delta });

    const remains = Math.max(0, TICK_INTERVAL - (Date.now() - start));

    setTimeout(this.startTick, remains);
  };

  async tick({ tickId, time, delta }) {
    const pig = await db().gameObjects.findOne({ type: 'pig' });

    if (pig) {
      const chunk = this.chunks.get(pig.chunkId);

      if (chunk) {
        const position = {
          x: Math.round(730 + 50 * Math.cos(time)),
          y: Math.round(650 + 50 * Math.sin(time)),
        };

        await chunk.updatePosition(pig, position);
      }
    }

    for (const playerClient of this.playerClients.values()) {
      if (playerClient.action) {
        const params = playerClient.action.params;

        switch (playerClient.action.type) {
          case 'moveTo': {
            const chunk = this.chunks.get(playerClient.chunkId);

            const playerObject = chunk.gameObjects.get(playerClient.id);
            const { x, y } = playerObject.position;

            const movement = {
              x: params.position.x - x,
              y: params.position.y - y,
            };

            const len = Math.sqrt(movement.x ** 2 + movement.y ** 2);

            const maxStep = BASE_PLAYER_SPEED * delta;

            let newPos;

            if (len > maxStep) {
              const factor = maxStep / len;

              newPos = {
                x: x + movement.x * factor,
                y: y + movement.y * factor,
              };
            } else {
              newPos = params.position;
              playerClient.action = null;
            }

            await chunk.updatePosition(playerObject, newPos);

            // Если изменилась позиция объекта игрока, то надо пересчитать чанки в playerClient
            playerClient.chunkId = playerObject.chunkId;

            const chunksIds = getAroundChunks(playerObject.chunkId);

            for (const chunkId of chunksIds) {
              if (!playerClient.chunksIds.includes(chunkId)) {
                playerClient.newChunks.add(chunkId);
              }
            }

            playerClient.chunksIds = chunksIds;

            for (const chunkId of playerClient.chunksIds) {
              await this.getChunk(chunkId);
            }

            break;
          }

          case 'createBuildingFrame': {
            const { position, building } = params;
            // TODO: Add range check

            const chunkId = positionToChunkId(position);

            const chunk = this.getChunkForce(chunkId);

            const obj = {
              id: generateId(),
              type: 'building-frame',
              position,
              size: {
                x: 5,
                y: 5,
              },
              meta: {
                building,
                resources: {
                  wood: {
                    have: 0,
                    need: 100,
                  },
                  stone: {
                    have: 0,
                    need: 20,
                  },
                },
              },
            };

            chunk.addObject(obj);

            this.newObjects.add(obj);

            playerClient.action = null;

            break;
          }

          case 'putResources': {
            const { buildingId, chunkId, resources } = params;
            const chunk = this.getChunkForce(chunkId);

            chunk.updateObject(buildingId, building => {
              for (const res of resources) {
                building.meta.resources[res.type].have += res.amount;
              }
            });

            break;
          }

          case 'build': {
            const chunk = this.getChunkForce(params.chunkId);

            chunk.updateObject(params.buildingId, building => {
              building.meta.percent += delta / 100;

              if (building.meta.percent >= 1) {
                building.type = building.meta.building;
                building.meta = undefined;

                playerClient.action = null;
              }
            });
            break;
          }
        }
      }
    }

    for (const tickAction of this.tickActions) {
      switch (tickAction.type) {
        case 'updateText':
          const { playerClient, text } = tickAction;

          const chunk = this.getChunkIfLoaded(playerClient.chunkId);

          chunk.updateObject(playerClient.id, player => {
            player.chatMessage = text;
          });
          break;
        default:
          throw new Error(`Invalid tick action [${tickAction.type}]`);
      }
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
      const updatedChunks = [];
      let position = null;

      for (const chunkId of playerClient.chunksIds) {
        const chunk = this.getChunkIfLoaded(chunkId);

        if (playerClient.newChunks.has(chunkId)) {
          updatedChunks.push({
            id: chunkId,
            updated: chunk.getObjectsExceptMeJSON(playerClient.id),
            removed: [],
          });
          continue;
        }

        const chunkDiff = {
          id: chunkId,
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
          updatedChunks.push(chunkDiff);
        }
      }

      if (playerClient.newChunks.size) {
        playerClient.newChunks = new Set();
      }

      const { x, y } = playerClient.lastPosition;

      if (
        updatedChunks.length === 0 &&
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
    if (this.tickActions.length) {
      this.tickActions = [];
    }

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

  getChunkForce(id) {
    const chunk = this.chunks.get(id);

    if (!chunk) {
      throw new Error('Chunk not loaded');
    }

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
    if (this.newObjects.size) {
      await Promise.all(
        Array.from(this.newObjects).map(obj => db().gameObjects.insertOne(obj))
      );
    }

    if (this.needSave.size) {
      await Promise.all(
        Array.from(this.needSave)
          .filter(obj => !this.newObjects.has(obj))
          .map(obj =>
            db().gameObjects.updateOne(
              { id: obj.id },
              {
                $set: {
                  type: obj.type,
                  chunkId: obj.chunkId,
                  position: obj.position,
                  meta: obj.meta,
                },
              }
            )
          )
      );

      this.needSave = new Set();
    }

    if (this.newObjects.size) {
      this.newObjects = new Set();
    }
  }

  updateTextFrom(playerClient, text) {
    this.tickActions.push({
      playerClient,
      type: 'updateText',
      text,
    });
  }

  transformToBuild(player, { buildingId, chunkId }) {
    const chunk = this.getChunkForce(chunkId);

    chunk.updateObject(buildingId, building => {
      building.type = 'building-frame:in-progress';
      building.meta = {
        building: building.meta.building,
        percent: 0,
      };
    });
  }
}

export function getGlobalState() {
  return instance;
}
