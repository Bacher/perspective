import { GameObject } from '../db';
import { positionToChunkId } from '../utils/chunks';

export async function generateObjects() {
  for (let i = 0; i < 1000; i++) {
    const position = {
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    };

    const obj = new GameObject({
      type: 'tree',
      chunkId: positionToChunkId(position),
      position,
    });

    await obj.save();
  }

  console.log('Generating complete');
}
