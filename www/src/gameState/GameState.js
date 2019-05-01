import { vec3, mat4 } from 'gl-matrix';

import { getCollision } from '../utils/coords';
import { client } from '../utils/Client';

const DEFAULT_SIZE = { x: 2, y: 2 };

export default class GameState {
  constructor() {
    window.state = this;

    this.width = 600;
    this.height = 400;
    this.viewPortOffset = {
      x: 0,
      y: 0,
    };

    this.angle = 15;
    this.scroll = 0;

    this.isPers = true;

    this.playerId = null;
    this.chunksIds = null;
    this.position = {
      x: 0,
      y: 0,
    };

    this.matrixes = {
      rot: mat4.create(),
      tra: mat4.create(),
      zoo: mat4.create(),
      per: mat4.create(),
      cam: mat4.create(),
      rotI: mat4.create(),
      traI: mat4.create(),
      zooI: mat4.create(),
      perI: mat4.create(),
      camI: mat4.create(),
    };

    this.applyMatrix();

    this.lastSpriteId = 0;

    this.dialogsOrder = [];

    this.player = {
      id: 'player',
      type: 'player',
      position: {
        x: 0,
        y: 0,
      },
      size: DEFAULT_SIZE,
      isFixed: true,
    };

    this.flag = {
      id: 'flag',
      type: 'flag',
      position: {
        x: 0,
        y: 0,
      },
      size: DEFAULT_SIZE,
    };

    this.sprites = new Map();

    this.sprites.set('player', this.player);
    this.sprites.set('flag', this.flag);

    this.dots = [
      {
        position: {
          x: 0,
          y: 0,
        },
      },
    ];

    this.comp = {};

    this.ui = {
      chat: false,
    };

    this.cursor = {
      mode: 'default',
      coords: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      meta: null,
    };
  }

  applyMatrix() {
    const angle = this.angle + 20 * this.scroll;

    mat4.perspective(
      this.matrixes.per,
      (75 * Math.PI) / 180,
      this.width / this.height,
      0.1,
      500
    );

    mat4.fromScaling(this.matrixes.cam, [-1, -1, 1]);

    mat4.fromXRotation(this.matrixes.rot, (-angle * Math.PI) / 180);

    mat4.fromTranslation(
      this.matrixes.tra,
      vec3.fromValues(-this.position.x, -this.position.y, 0)
    );

    mat4.fromTranslation(
      this.matrixes.zoo,
      vec3.fromValues(0, 0, 200 + 100 * this.scroll)
    );
  }

  calcInvertMatrix() {
    mat4.invert(this.matrixes.perI, this.matrixes.per);
    mat4.invert(this.matrixes.zooI, this.matrixes.zoo);
    mat4.invert(this.matrixes.rotI, this.matrixes.rot);
    mat4.invert(this.matrixes.traI, this.matrixes.tra);
    mat4.invert(this.matrixes.camI, this.matrixes.cam);
  }

  getScreenCoords({ x, y, z }, isFixed) {
    const res = vec3.fromValues(x, y, z || 0);

    // const mView = mPer.multiply(mTr).multiply(mRot);
    if (!isFixed) {
      vec3.transformMat4(res, res, this.matrixes.tra);
      vec3.transformMat4(res, res, this.matrixes.rot);
      vec3.transformMat4(res, res, this.matrixes.zoo);
    }

    vec3.transformMat4(res, res, this.matrixes.cam);

    if (this.isPers) {
      vec3.transformMat4(res, res, this.matrixes.per);
    }

    return {
      x: res[0] * (this.isPers ? this.width / 2 : 1) + this.width / 2,
      y: res[1] * (this.isPers ? this.height / 2 : 1) + this.height / 2,
      z: res[2],
    };
  }

  normalizeCoords(pos) {
    return {
      x: pos.x - this.viewPortOffset.x,
      y: pos.y - this.viewPortOffset.y,
    };
  }

  project(screenCoords) {
    this.calcInvertMatrix();

    const point = {
      x: screenCoords.x - this.width / 2,
      y: screenCoords.y - this.height / 2,
    };

    if (this.isPers) {
      point.x /= this.width / 2;
      point.y /= this.height / 2;
    }

    const r1 = this.projectPoint({ ...point, z: 0.4 });
    const r2 = this.projectPoint({ ...point, z: 0.5 });

    const l = r1.x - r2.x;
    const m = r1.y - r2.y;
    const n = r1.z - r2.z;

    const zValue = -r1.z / n;

    return {
      x: zValue * l + r1.x,
      y: zValue * m + r1.y,
    };
  }

  projectPoint(point) {
    const res = vec3.fromValues(point.x, point.y, point.z);

    if (this.isPers) {
      vec3.transformMat4(res, res, this.matrixes.perI);
    }
    vec3.transformMat4(res, res, this.matrixes.camI);
    vec3.transformMat4(res, res, this.matrixes.zooI);
    vec3.transformMat4(res, res, this.matrixes.rotI);
    vec3.transformMat4(res, res, this.matrixes.traI);

    return {
      x: res[0],
      y: res[1],
      z: res[2],
    };
  }

  spritesUpdated() {
    this.comp.sprites.forceUpdate();

    if (this.comp.ground) {
      this.comp.ground.forceUpdate();
    }

    if (this.comp.buildDialog) {
      this.comp.buildDialog.forceUpdate();
    }
  }

  moveTo({ x, y }) {
    this.flag.position = { x, y };
    this.flag.isHidden = false;

    this.spritesUpdated();

    const curX = this.position.x;
    const curY = this.position.y;

    const dX = x - curX;
    const dY = y - curY;
    let i = 0;

    const distance = Math.sqrt(dX * dX + dY * dY);
    const steps = distance / 1;

    clearInterval(this.moveInterval);
    this.moveInterval = setInterval(() => {
      const sigma = Math.min(1, i / steps);

      this.position.x = curX + dX * sigma;
      this.position.y = curY + dY * sigma;

      i++;

      if (sigma === 1) {
        this.flag.isHidden = true;
        clearInterval(this.moveInterval);
      }

      this.applyMatrix();
      this.spritesUpdated();
    }, 16);
  }

  applyGameState(gameState) {
    this.playerId = gameState.playerId;
    this.position = gameState.position;
    this.chunksIds = gameState.chunksIds;

    let sprites = [['player', this.player], ['flag', this.flag]];

    for (const chunk of gameState.chunks) {
      const items = chunk.gameObjects.map(obj => {
        obj.chunkId = chunk.id;

        if (!obj.size) {
          obj.size = DEFAULT_SIZE;
        }

        return [obj.id, obj];
      });

      sprites = sprites.concat(items);
    }

    this.sprites = new Map(sprites);

    this.applyMatrix();
    this.spritesUpdated();
    this.updateCursor();
  }

  updateWorld(data) {
    this.position = data.position;

    const deletedChunks = [];

    for (const chunkId of this.chunksIds) {
      if (!data.chunksIds.includes(chunkId)) {
        deletedChunks.push(chunkId);
      }
    }

    this.chunksIds = data.chunksIds;

    for (const chunk of data.updatedChunks) {
      for (const obj of chunk.updated) {
        obj.chunkId = chunk.id;
        const sprite = this.sprites.get(obj.id);

        if (sprite) {
          sprite.type = obj.type;
          sprite.position = obj.position;
          sprite.chatMessage = obj.chatMessage;
          sprite.meta = obj.meta;
        } else {
          if (!obj.size) {
            obj.size = { x: 2, y: 2 };
          }
          this.sprites.set(obj.id, obj);
        }
      }
    }

    if (deletedChunks.length) {
      for (const [id, sprite] of this.sprites) {
        if (deletedChunks.includes(sprite.chunkId)) {
          this.sprites.delete(id);
        }
      }
    }

    if (this.target && this.target.activatePosition) {
      const a = this.target.activatePosition;

      if (a.x === this.position.x && a.y === this.position.y) {
        this.target.activatePosition = null;

        const { object } = this.target;

        if (object.type === 'building-frame') {
          this.toggleDialog('buildDialog', true);
        }

        if (object.type === 'building-frame:in-progress') {
          client().send('startBuild', {
            buildingId: object.id,
            chunkId: object.chunkId,
          });
        }
      }
    }

    this.applyMatrix();
    this.spritesUpdated();
    this.updateCursor();
  }

  openContextMenu(position) {
    this.contextMenu = {
      position,
      items: [
        {
          text: 'Collect',
        },
        {
          text: 'Harvest',
        },
      ],
    };

    this.comp.contextMenu.forceUpdate();
  }

  closeContextMenu() {
    this.contextMenu = null;

    this.comp.contextMenu.forceUpdate();
  }

  updateCursor() {
    this.cursor.position = this.project(this.cursor.coords);
  }

  setCursorCoords(coords) {
    this.cursor.coords = coords;
    this.cursor.position = this.project(coords);
    this.spritesUpdated();
  }

  updateUI(callback) {
    this.ui = callback(this.ui);
    this.comp.ui.forceUpdate();
  }

  toggleDialog(dialogName, show) {
    if (arguments.length === 1) {
      show = !this.dialogsOrder.includes(dialogName);
    }

    this.dialogsOrder = this.dialogsOrder.filter(name => name !== dialogName);

    if (show) {
      this.dialogsOrder.push(dialogName);
    }

    this.comp.dialogs.forceUpdate();
  }

  popDialogToTop(dialogName) {
    if (this.dialogsOrder.length) {
      const index = this.dialogsOrder.indexOf(dialogName);

      if (index !== -1 && index !== this.dialogsOrder.length - 1) {
        this.dialogsOrder.splice(index, 1);
        this.dialogsOrder.push(dialogName);
        this.comp.dialogs.forceUpdate();
      }
    }
  }

  hideAllDialogs() {
    this.dialogsOrder = [];
    this.comp.dialogs.forceUpdate();
  }

  setCursorMode(mode, meta) {
    this.cursor.mode = mode;
    this.cursor.meta = meta || null;

    this.spritesUpdated();
  }

  clickToObject(obj) {
    const collisionPoint = getCollision(obj, this.position);

    this.target = {
      object: obj,
      activatePosition: collisionPoint,
    };

    this.drawDot(collisionPoint);

    if (
      this.position.x !== collisionPoint.x ||
      this.position.y !== collisionPoint.y
    ) {
      client().send('moveTo', {
        position: collisionPoint,
      });
    }
  }

  drawDot(position) {
    this.dots.push({
      position,
    });
  }
}
