const { vec3, vec4, mat3, mat4 } = glMatrix;

const canvas = document.getElementById('canvas');

canvas.width = 400;
canvas.height = 400;

let xAngle = 9;

const cube = [
  // Top
  [{ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }],
  [{ x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }],
  [{ x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }],
  [{ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }],
  // Bottom
  [{ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }],
  [{ x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }],
  [{ x: 1, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }],
  [{ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }],
  // Sides
  [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }],
  [{ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }],
  [{ x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }],
  [{ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }],
];

let deltaX = 0;
let deltaY = 0;

function translate({ x, y, z }, distance) {
  return {
    x: x + distance,
    y: y + distance,
    z: z + distance,
  };
}

function scale({ x, y, z }, factor) {
  return {
    x: x * factor,
    y: y * factor,
    z: z * factor,
  };
}

function draw() {
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.strokeStyle = '#ddd';
  ctx.fillStyle = '#fff';

  ctx.fillRect(0, 0, 400, 400);
  ctx.translate(200, 200);

  ctx.beginPath();

  for (let [from, to] of cube) {
    from = translate(scale(from, 100), -50);
    to = translate(scale(to, 100), -50);

    const mPer = mat4.create();
    const mTr = mat4.create();
    const mRot = mat4.create();

    // const mPer = Matrix.perspective(2, 1, 0.1, 1000);
    mat4.perspective(mPer, (2 * Math.PI) / 180, 1, 0.1, 1000);

    // const mTr = Matrix.translate(20, 0, 200);
    mat4.fromTranslation(mTr, vec3.fromValues(20, 0, 200));
    // const mRot = Matrix.rotate(xAngle, 1, 0, 0);
    mat4.rotateX(mRot, mRot, (xAngle * Math.PI) / 180);

    console.log('per', mPer);
    console.log('tr', mTr);
    console.log('rot', mRot);

    // const mView = mPer;
    // const mView = mRot.multiply(mPer);
    // const mView = mPer.multiply(mRot);

    // const mView = mPer.multiply(mTr).multiply(mRot);

    const func = ({ x, y, z }) => {
      let res = vec3.fromValues(x, y, z);

      vec3.transformMat4(res, res, mRot);
      vec3.transformMat4(res, res, mTr);
      vec3.transformMat4(res, res, mPer);

      // res = mRot.transformPoint(res);
      // res = mTr.transformPoint(res);
      // res = mPer.transformPoint(res);

      // res = mView.transformPoint(res);

      return {
        x: res[0],
        y: res[1],
        z: res[2],
      };
    };

    const from1 = func(from);
    const to1 = func(to);

    console.log(from1);

    if (
      Number.isFinite(from1.x) &&
      Number.isFinite(from1.y) &&
      Number.isFinite(to1.x) &&
      Number.isFinite(to1.y)
    ) {
      ctx.moveTo(from1.x, from1.y);
      ctx.lineTo(to1.x, to1.y);
    }
  }

  ctx.stroke();

  ctx.restore();

  // requestAnimationFrame(draw);
}

function perspect(point) {
  const mPer = mat4.create();
  const mRot = mat4.create();
  // const mView = mat4.create();
  mat4.identity(mPer);

  mat4.perspective(mPer, Math.PI * 0.45, 1, 0.1, 1000);
  mat4.fromXRotation(mRot, (Math.PI / 180) * angle);

  // mat4.multiply(mView, mPer, mRot);

  const mView = mPer;
  // mat4.rotateX(mView, mView, (Math.PI / 180) * 10);
  // console.log('A', mView, deltaX);
  // mat4.translate(mView, mView, [-deltaX, -deltaY, 0]);
  // console.log('B', mView);

  const p = vec4.fromValues(point.x, point.y, point.z, 1.0);
  console.log(p);
  vec4.transformMat4(p, p, mRot);
  console.log(p);
  vec4.transformMat4(p, p, mView);
  console.log(p);

  return {
    x: p[0],
    y: p[1],
    z: p[2],
  };
}

// window.addEventListener('mousemove', e => {
//     deltaX += e.movementX;
//     deltaY += e.movementY;
// });

draw();

// setInterval(() => {
//     angle += 1;
// }, 16);
