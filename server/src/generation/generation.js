import { db } from '../Mongo';
import { positionToChunkId } from '../utils/chunks';

const ADD_TREES = false;
const ADD_PIG = false;

export async function generateObjects() {
  if (ADD_TREES) {
    const items = [];

    for (let i = 0; i < 10000; i++) {
      const position = {
        x: Math.round(Math.random() * 10000),
        y: Math.round(Math.random() * 10000),
      };

      items.push({
        type: 'tree',
        chunkId: positionToChunkId(position),
        position,
      });
    }

    await db().gameObjects.insertMany(items);

    console.log('Generating trees complete');
  }

  if (ADD_PIG) {
    const position = {
      x: 730,
      y: 650,
    };

    await db().gameObjects.insert({
      type: 'pig',
      chunkId: positionToChunkId(position),
      position,
    });

    console.log('Generating pig complete');
  }
}
