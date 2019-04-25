import { db } from '../Mongo';
import { positionToChunkId } from '../utils/chunks';

export default class ChunkState {
  constructor(globalState, id) {
    this.globalState = globalState;
    this.id = id;

    this.gameObjects = null;

    this.updatedObjects = new Set();
    // TODO: Учесть ситуацию когда одним действием в tick объект уходит за пределы chunk
    // а другим действием в этом же tick возвращается в этот chunk
    this.removedObjects = new Set();

    this.loading = new Promise(resolve => {
      this._resolveLoading = resolve;
    });
  }

  async load() {
    this._resolveLoading(this._load());
    await this.loading;
    this.loading = null;
  }

  async _load() {
    const objects = await db()
      .gameObjects.find({
        chunkId: this.id,
      })
      .toArray();

    const items = objects.map(obj => [obj.id, obj]);

    this.gameObjects = new Map(items);
  }

  tickCleanUp() {
    if (this.updatedObjects.size) {
      this.updatedObjects = new Set();
    }

    if (this.removedObjects.size) {
      this.removedObjects = new Set();
    }
  }

  async addObject(obj) {
    obj.chunkId = this.id;

    await this.loading;

    this.gameObjects.set(obj.id, obj);
    this.updatedObjects.add(obj);
  }

  getObjectsExceptMeJSON(playerId) {
    const items = [];

    for (const [id, obj] of this.gameObjects) {
      if (id !== playerId) {
        items.push(formatObject(obj));
      }
    }

    return items;
  }

  async updatePosition(obj, pos) {
    const chunkId = positionToChunkId(pos);

    obj.position = pos;

    this.globalState.markObjectAsUpdated(obj);

    if (chunkId === this.id) {
      this.updatedObjects.add(obj);
    } else {
      this.gameObjects.delete(obj.id);
      this.removedObjects.add(obj);

      const moveToChunk = this.globalState.getChunkIfLoaded(chunkId);

      if (moveToChunk) {
        await moveToChunk.addObject(obj);
      }
    }
  }

  updateObject(id, callback) {
    const obj = this.gameObjects.get(id);

    if (!obj) {
      throw new Error();
    }

    callback(obj);

    this.updatedObjects.add(obj);
    // TODO: Нужно условие когда нужно сохранять в БД.
  }
}

export function formatObject(obj) {
  return {
    id: obj.id,
    type: obj.type,
    position: obj.position,
    size: obj.size,
    playerName: obj.playerName,
    chatMessage: obj.chatMessage,
    meta: obj.meta,
  };
}
