import { db } from '../Mongo';
import { positionToChunkId } from '../utils/chunks';

export async function generateObjects() {
  const items = [];

  // for (let i = 0; i < 1000; i++) {
  //   const position = {
  //     x: Math.round(Math.random() * 1000),
  //     y: Math.round(Math.random() * 1000),
  //   };
  //
  //   items.push({
  //     type: 'tree',
  //     chunkId: positionToChunkId(position),
  //     position,
  //   });
  // }

  const position = {
    x: 730,
    y: 650,
  };

  items.push({
    type: 'pig',
    chunkId: positionToChunkId(position),
    position,
  });

  await db().gameObjects.insertMany(items);

  console.log('Generating complete');
}
