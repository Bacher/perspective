import { GameObject } from '../db';
import { positionToChunkId } from '../utils/chunks';

export default class ChunkState {
  constructor(globalState, id) {
    this.globalState = globalState;
    this.id = id;

    this.gameObjects = null;
    this.hasChanges = false;

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
    const objects = await GameObject.find({
      chunkId: this.id,
    });

    const items = objects.map(obj => [obj._id.toString(), obj]);

    this.gameObjects = new Map(items);
  }

  async saveChanges() {
    for (const object of this.updatedObjects) {
      await object.save();
    }

    this.updatedObjects = new Set();
    this.removedObjects = new Set();
    this.hasChanges = false;
  }

  async addObject(obj) {
    obj.chunkId = this.id;

    await this.loading;

    this.gameObjects.set(obj._id.toString(), obj);
    this.updatedObjects.add(obj);
  }

  getObjectsExceptMeJSON(playerId) {
    const items = [];

    for (const [id, obj] of this.gameObjects) {
      if (id !== playerId) {
        const data = obj.toJSON();

        data.id = data._id;
        data._id = undefined;
        data.__v = undefined;
        data.chunkId = undefined;

        items.push(data);
      }
    }

    return items;
  }

  async updatePosition(obj, pos) {
    const chunkId = positionToChunkId(pos);

    obj.position = pos;

    if (chunkId === this.id) {
      this.updatedObjects.add(obj);
      this.hasChanges = true;
    } else {
      this.gameObjects.delete(obj._id.toString());
      this.removedObjects.add(obj);

      const moveToChunk = this.globalState.getChunkIfLoaded(chunkId);

      if (moveToChunk) {
        await moveToChunk.addObject(obj);
      }
    }
  }
}
