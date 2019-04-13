import { MongoClient } from 'mongodb';

let instance = null;

export async function connect() {
  const connection = await MongoClient.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
  });

  const db = connection.db('perspective');

  instance = {
    db,
    gameObjects: db.collection('gameobject'),
    players: db.collection('players'),
  };

  await instance.gameObjects.createIndex({ chunkId: 1 });
  await instance.players.createIndex({ username: 1 }, { unique: true });
}

export function db() {
  return instance;
}