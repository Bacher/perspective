import { GameObject } from '../db';

export async function generateObjects() {
  for (let i = 0; i < 1000; i++) {
    const obj = new GameObject({
      type: 'tree',
      chunkId: 0,
      position: {
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
      },
    });

    await obj.save();
  }

  console.log('Generating complete');
}
