import ChunkState from './ChunkState';
import { Player, GameObject } from '../db';

const PLAYER_ID = '5caf5a1e97b28b78760ff69b';

const TICK_INTERVAL = 33;
let instance = null;

export default class GlobalState {
  constructor() {
    instance = this;
    this.chunks = new Map();
    this.players = new Set();
  }

  async init() {
    this.startTick();
  }

  connectPlayerClient(playerClient) {
    this.players.add(playerClient);
  }

  async getPlayerStateSnapshot(playerClient) {
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

    const playerId = playerObject._id;
    const chunkId = playerObject.chunkId;

    const chunk = await this.getChunk(chunkId);

    playerClient.id = playerId;
    playerClient.inGame = true;

    return {
      playerId: playerId,
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
    this.updatedObjects = new Set();

    const chunk = this.chunks.get(0);

    if (chunk) {
      const player = chunk.gameObjects.get(PLAYER_ID);

      player.position.x += 0.5;
      player.position.y += 0.1;

      this.updatedObjects.add(player);
    }

    await Promise.all([this.sendUpdates(), this.saveChanges()]);
  }

  async sendUpdates() {
    const players = Array.from(this.players.values());

    await Promise.all(
      players.map(player => {
        if (!player.inGame) {
          return;
        }

        const updates = [];
        let position = null;

        for (const obj of this.updatedObjects) {
          if (obj._id === player.id) {
            position = obj.position;
          } else if (player.chunksIds.includes(obj.chunkId)) {
            updates.push(obj);
          }
        }

        player.send({
          position,
          updates,
        });
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
