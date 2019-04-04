const { vec3, vec4, mat3, mat4 } = glMatrix;

const canvas = document.getElementById('canvas');

canvas.width = 400;
canvas.height = 400;

let angle = 10;

const figure = [
    { x: -50, y: 0, z: -50 },
    { x: -50, y: 0, z: 50 },
    { x: 50, y: 0, z: 50 },
    { x: 50, y: 0, z: -50 },
    { x: -50, y: 0, z: -50 },
];

// const figure = [
//     { x: -50, y: -50, z: -50 },
//     { x: -50, y: 50, z: 50 },
//     { x: 50, y: 50, z: 50 },
//     { x: 50, y: -50, z: -50 },
//     { x: -50, y: -50, z: -50 },
// ];

let deltaX = 0;
let deltaY = 0;

function draw() {
    const ctx = canvas.getContext('2d');

    //ctx.strokeStyle = '#000';

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 400, 400);
    ctx.translate(200, 200);

    let isStart = true;

    for (const point of figure) {
        const n = perspect({
            x: point.x + deltaX,
            y: point.y,
            z: point.z - deltaY,
        });

        if (isStart) {
            isStart = false;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
        } else {
            ctx.lineTo(n.x, n.y);
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

window.addEventListener('mousemove', e => {
    deltaX += e.movementX;
    deltaY += e.movementY;
});

draw();

setInterval(() => {
    angle += 1;
}, 16);
