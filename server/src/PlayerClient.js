import { Player, GameObject } from './db';
import { renameIds } from './utils/db';

export default class PlayerClient {
  constructor(connection, { username }) {
    this.con = connection;
    this.username = username;
  }

  async handleRequest(methodName, params) {
    switch (methodName) {
      case 'getCurrentState':
        const player = await Player.findOne({
          username: this.username,
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
            username: this.username,
            gameObjectId: playerObject._id,
          }).save();
        } else {
          playerObject = await GameObject.findOne({
            _id: player.gameObjectId,
          });
        }

        const gameObjects = await GameObject.find({
          chunkId: playerObject.chunkId,
          _id: {
            $ne: playerObject._id,
          },
        }).lean();

        renameIds(gameObjects);

        return {
          position: playerObject.position,
          gameObjects,
        };
      default:
        throw new Error('Invalid method name');
    }
  }
}
