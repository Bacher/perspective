import BUILDINGS from '../constants/buildings';
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
    this.removedObjects = new Set();
    this.needSave = new Set();
    this.tickActions = [];
    this.lastGeneratedIndex = 0;
    this.inventoryChanged = false;

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

    let playerId = player.gameObjectId;
    let chunkId = null;

    if (!player) {
      const position = {
        x: 700,
        y: 700,
      };

      chunkId = positionToChunkId(position);
      playerId = generateId();

      const playerObject = {
        id: playerId,
        type: 'player',
        position,
        playerName: playerClient.username,
        chunkId,
        meta: {},
        private: {
          inventory: {
            wood: 5000,
          },
        },
      };

      await db().gameObjects.insertOne(playerObject);

      await db().players.insertOne({
        username: playerClient.username,
        gameObjectId: playerId,
      });

      const chunk = this.getChunkIfLoaded(playerObject.chunkId);

      if (chunk) {
        chunk.addObject(playerObject);
      }
    } else {
      const playerObject = await db().gameObjects.findOne(
        {
          id: player.gameObjectId,
        },
        { chunkId: 1 }
      );

      chunkId = playerObject.chunkId;
    }

    playerClient.id = playerId;
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

    const playerObject = this.getChunkForce(chunkId).gameObjects.get(playerId);
    playerClient.gameObject = playerObject;

    return {
      playerId: playerId,
      chunkId: playerClient.chunkId,
      chunksIds: playerClient.chunksIds,
      position: playerObject.position,
      inventory: playerObject.private.inventory,
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
    /*
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
    */

    for (const playerClient of this.playerClients.values()) {
      if (playerClient.action) {
        const { type, params } = playerClient.action;

        switch (type) {
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
              playerClient.actionDone();
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
              size: BUILDINGS[building].size,
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

            playerClient.actionDone();

            break;
          }

          case 'putResources': {
            const { buildingId, chunkId, resources } = params;
            const { inventory } = playerClient.gameObject.private;

            if (
              resources.some(res => {
                if (!inventory[res.type] || inventory[res.type] < res.amount) {
                  return true;
                }
              })
            ) {
              playerClient.actionError('NOT_ENOUGH');
              break;
            }

            const chunk = this.getChunkForce(chunkId);

            for (const res of resources) {
              inventory[res.type] -= res.amount;

              if (inventory[res.type] === 0) {
                delete inventory[res.type];
              }
            }

            playerClient.inventoryChanged = true;
            this.needSave.add(playerClient.gameObject);

            chunk.updateObject(buildingId, building => {
              for (const res of resources) {
                building.meta.resources[res.type].have += res.amount;
              }
            });

            playerClient.actionDone();

            break;
          }

          case 'transformToBuild': {
            const { buildingId, chunkId } = params;

            const chunk = this.getChunkForce(chunkId);

            chunk.updateObject(buildingId, building => {
              building.type = 'building-frame:in-progress';
              building.meta = {
                building: building.meta.building,
                percent: 0,
              };
            });

            playerClient.actionDone();
            break;
          }

          case 'build': {
            const chunk = this.getChunkForce(params.chunkId);

            chunk.updateObject(params.buildingId, building => {
              building.meta.percent += delta / 100;

              if (building.meta.percent >= 1) {
                building.type = building.meta.building;
                building.meta = undefined;

                playerClient.actionDone();
              }
            });
            break;
          }

          case 'harvest': {
            const chunk = this.getChunkForce(playerClient.chunkId);

            chunk.updateObject(playerClient.id, player => {
              if (
                player.currentAction &&
                player.currentAction.targetId === params.objectId
              ) {
                player.currentAction.percent += delta / 10;

                if (player.currentAction.percent >= 1) {
                  player.currentAction = undefined;

                  this.removedObjects.add(params.objectId);
                  const targetChunk = this.getChunkForce(params.chunkId);
                  targetChunk.removeObjectById(params.objectId);

                  playerClient.actionDone();
                }
              } else {
                player.currentAction = {
                  type: 'harvest',
                  targetId: params.objectId,
                  percent: 0,
                };
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
      let playerUpdated = false;

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
            playerUpdated = true;
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

      if (updatedChunks.length === 0 && !playerUpdated) {
        return;
      }

      const actionsResults = {
        done: [],
        fail: [],
      };

      if (playerClient.doneActions.length) {
        actionsResults.done = playerClient.doneActions;
        playerClient.doneActions = [];
      }

      if (playerClient.failActions.length) {
        actionsResults.fail = playerClient.failActions;
        playerClient.failActions = [];
      }

      playerClient
        .send('worldUpdates', {
          position: playerClient.gameObject.position,
          chunksIds: playerClient.chunksIds,
          updatedChunks,
          currentAction: playerClient.gameObject.currentAction,
          actionsResults:
            actionsResults.done.length || actionsResults.fail.length
              ? actionsResults
              : undefined,
          inventory: playerClient.inventoryChanged
            ? playerClient.gameObject.private.inventory
            : undefined,
        })
        .catch(err => {
          console.error('Send event failed:', err);
        });

      playerClient.inventoryChanged = false;
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

    if (this.removedObjects.size) {
      await Promise.all(
        Array.from(this.removedObjects).map(id =>
          db().gameObjects.deleteOne({ id })
        )
      );
      this.removedObjects = new Set();
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
                  private: obj.private,
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
}

export function getGlobalState() {
  return instance;
}
