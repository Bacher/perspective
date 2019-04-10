import { Player, GameObject } from './db';

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

        let gameObject;

        if (!player) {
          gameObject = await new GameObject({
            type: 'player',
            pos: {
              x: 0,
              y: 0,
            },
            chunkId: 0,
          }).save();

          await new Player({
            username: this.username,
            gameObjectId: gameObject._id,
          }).save();
        } else {
          gameObject = await GameObject.findOne({
            _id: player.gameObjectId,
          });
        }

        return {
          objects: [
            {
              type: 'player',
              isYou: true,
              position: gameObject.pos,
            },
          ],
        };
      default:
        throw new Error('Invalid method name');
    }
  }
}
