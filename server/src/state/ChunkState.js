import { GameObject } from '../db';
import { renameIds } from '../utils/db';

export default class ChunkState {
  constructor(id) {
    this.id = id;

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

    const items = [];

    for (const obj of objects) {
      items.push([obj._id, obj]);
    }

    this.gameObjects = new Map(items);
  }

  getObjectsExceptMeJSON(playerId) {
    const items = [];

    for (const obj of this.gameObjects) {
      if (obj._id !== playerId) {
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
}
