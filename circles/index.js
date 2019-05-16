const canvas = document.getElementById('canvas');

const SIZE = 7;
const RADIUS = SIZE / 2;
const STEP = 400 / SIZE;

const ctx = canvas.getContext('2d');

ctx.translate(210, 210);

ctx.strokeStyle = '#ccc';

for (let x = -200; x <= 201; x += STEP) {
  ctx.beginPath();
  ctx.moveTo(x, -200);
  ctx.lineTo(x, 200);
  ctx.stroke();
}

for (let y = -200; y <= 201; y += STEP) {
  ctx.beginPath();
  ctx.moveTo(-200, y);
  ctx.lineTo(200, y);
  ctx.stroke();
}

ctx.strokeStyle = '#000';
ctx.fillStyle = '#f00';
ctx.beginPath();
ctx.arc(0, 0, 200, 0, 2 * Math.PI);
ctx.stroke();

for (let i = -RADIUS; i <= +RADIUS; i++) {
  const x = Math.sqrt(RADIUS ** 2 - i ** 2);

  const xx = Math.round(x - 0.5) + 0.5;

  ctx.beginPath();
  ctx.arc(xx * STEP, i * STEP, 4, 0, 2 * Math.PI);
  ctx.fill();
}
