import { ObjectId } from 'mongodb';
import { db } from '../Mongo';
import { positionToChunkId } from '../utils/chunks';

const ADD_TREES = false;
const ADD_PIG = false;
const ADD_HOME = false;

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
      x: 700,
      y: 710,
    };

    await db().gameObjects.insertOne({
      type: 'pig',
      chunkId: positionToChunkId(position),
      position,
    });

    console.log('Generating pig complete');
  }

  if (ADD_HOME) {
    const position = {
      x: 800,
      y: 800,
    };

    await db().gameObjects.insertOne({
      type: 'home',
      chunkId: positionToChunkId(position),
      position,
      ownerId: ObjectId('5cb39d8bf65b6779edd044a7'),
    });

    console.log('Generating home complete');
  }
}
