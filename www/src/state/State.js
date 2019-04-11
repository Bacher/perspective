import { vec3, mat4 } from 'gl-matrix';
import state from './index';

export default class State {
  constructor() {
    window.state = this;

    this.width = 600;
    this.height = 400;

    this.angle = 20;
    this.scroll = 0;

    this.isPers = true;

    this.position = {
      x: 0,
      y: 0,
    };

    this.matrixes = {
      rot: mat4.create(),
      tra: mat4.create(),
      per: mat4.create(),
      cam: mat4.create(),
      rotI: mat4.create(),
      traI: mat4.create(),
      perI: mat4.create(),
      camI: mat4.create(),
    };

    this.applyMatrix();

    this.lastSpriteId = 0;

    this.player = {
      id: 'player',
      type: 'man',
      position: {
        x: 0,
        y: 0,
      },
      isFixed: true,
    };

    this.flag = {
      id: 'flag',
      type: 'flag',
      position: {
        x: 0,
        y: 0,
      },
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
      {
        position: {
          x: -150,
          y: -100,
          z: 0,
        },
      },
    ];
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

    mat4.fromScaling(this.matrixes.cam, [-1, 1, 1]);

    mat4.fromXRotation(this.matrixes.rot, (angle * Math.PI) / 180);

    mat4.fromTranslation(
      this.matrixes.tra,
      vec3.fromValues(
        -this.position.x,
        -this.position.y,
        300 + 100 * this.scroll
      )
    );
  }

  calcInvertMatrix() {
    mat4.invert(this.matrixes.perI, this.matrixes.per);
    mat4.invert(this.matrixes.rotI, this.matrixes.rot);
    mat4.invert(this.matrixes.traI, this.matrixes.tra);
    mat4.invert(this.matrixes.camI, this.matrixes.cam);
  }

  getScreenCoords({ x, y, z }, isFixed) {
    const res = vec3.fromValues(x, y, z || 0);

    // const mView = mPer.multiply(mTr).multiply(mRot);
    if (!isFixed) {
      vec3.transformMat4(res, res, this.matrixes.rot);
      vec3.transformMat4(res, res, this.matrixes.tra);
    }

    vec3.transformMat4(res, res, this.matrixes.cam);

    if (this.isPers) {
      vec3.transformMat4(res, res, this.matrixes.per);
    }

    return {
      x: res[0] * (this.isPers ? this.width : 1) + this.width / 2,
      y: res[1] * (this.isPers ? this.height : 1) + this.height / 2,
      z: res[2],
    };
  }

  project(screenCoords) {
    this.calcInvertMatrix();

    const point = {
      x: screenCoords.x - this.width / 2,
      y: screenCoords.y - this.height / 2,
    };

    if (this.isPers) {
      point.x /= this.width;
      point.y /= this.height;
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
    vec3.transformMat4(res, res, this.matrixes.traI);
    vec3.transformMat4(res, res, this.matrixes.rotI);

    return {
      x: res[0],
      y: res[1],
      z: res[2],
    };
  }

  registerSpritesComponent(spritesComp) {
    this.spritesComp = spritesComp;
  }

  spritesUpdated() {
    this.spritesComp.forceUpdate();
  }

  moveTo({ x, y }) {
    state.flag.position = { x, y };
    state.flag.isHidden = false;

    state.spritesUpdated();

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
    this.position = gameState.position;

    this.sprites = new Map(
      [['player', this.player], ['flag', this.flag]].concat(
        gameState.gameObjects.map(gameObject => [gameObject.id, gameObject])
      )
    );

    this.applyMatrix();
    this.spritesUpdated();
  }
}
