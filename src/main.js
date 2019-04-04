const canvas = document.getElementById('canvas');

canvas.width = 400;
canvas.height = 400;

let xAngle = 9;

const ctx = canvas.getContext('2d');

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
  ctx.save();
  ctx.strokeStyle = '#ddd';

  ctx.fillStyle = '#fff';

  ctx.fillRect(0, 0, 400, 400);
  ctx.translate(200, 200);

  ctx.beginPath();

  for (let [from, to] of cube) {
    from = translate(scale(from, 100), -50);
    to = translate(scale(to, 100), -50);

    const mPer = Matrix.perspective(2, 1, 0.1, 1000);
    // Matrix.rotate(xAngle, 1, 0, 0, mPer);
    const mTr = Matrix.translate(20, 0, 200);
    const mRot = Matrix.rotate(xAngle, 1, 0, 0);

    console.log('per', mPer.m);
    console.log('tr', mTr.m);
    console.log('rot', mRot.m);

    // const mView = mPer;
    // const mView = mRot.multiply(mPer);
    // const mView = mPer.multiply(mRot);

    const mView = mPer.multiply(mTr).multiply(mRot);

    const func = point => {
      let res = point;

      // res = mRot.transformPoint(res);
      // res = mTr.transformPoint(res);
      // res = mPer.transformPoint(res);

      res = mView.transformPoint(res);

      return res;
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
}

draw();

// setInterval(() => {
//   xAngle += 9;
//
//   draw();
// }, 100);
