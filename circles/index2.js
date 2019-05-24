const diameterInput = document.getElementById('diameterInput');

function draw(diameter) {
  console.log('Draw', diameter);
  diameterInput.value = diameter;
  document.location.hash = `#${diameter}`;

  const radius = diameter / 2;
  const oddDiameter = diameter % 2 === 1;
  const size = 200;
  const multiplier = size / radius;

  const sqrt2 = 0.7071067811865475;
  const r2 = radius * radius;

  let prevX = -radius;
  let points = [];

  const yEnd = Math.round(radius * sqrt2);
  const offset = oddDiameter ? 0.5 : 0;

  let started = false;

  for (let y = 1 + offset; y <= yEnd; y++) {
    for (let x = prevX; x < 0; x++) {
      const distance2 = (x + 0.5) ** 2 + (y + 0.5) ** 2;

      if (distance2 <= r2) {
        if (x === -radius) {
          break;
        }

        if (!started) {
          points.push({
            x: -radius,
            y: y,
          });

          started = true;
        }

        prevX = x;

        points.push({
          x,
          y,
        });

        if (y !== yEnd || -x >= y) {
          points.push({
            x,
            y: y + 1,
          });
        }

        break;
      }
    }
  }

  printPoints();

  const len = points.length;

  for (let i = len - 1; i >= 0; i--) {
    const point = points[i];

    points.push({
      x: -point.y,
      y: -point.x,
    });
  }

  const newPoints = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const pp = newPoints[newPoints.length - 1];
    const p = points[i];
    const pn = points[i + 1];

    // newPoints.push(p);
    // continue;

    if (pn.x === p.x && pn.y === p.y) {
      continue;
    }

    if (pp.x === pn.x || pp.y === pn.y) {
      continue;
    }

    newPoints.push(p);
  }

  newPoints.push(points[points.length - 1]);

  points = newPoints;

  for (let i = 0; i < points.length; i++) {}

  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i];

    points.push({
      x: -point.x,
      y: point.y,
    });
  }

  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i];

    points.push({
      x: point.x,
      y: -point.y,
    });
  }

  // printPoints()

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 440, 440);
  ctx.save();

  ctx.translate(size + 20.5, size + 20.5);

  ctx.strokeStyle = '#000';
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';

  ctx.beginPath();
  ctx.moveTo(-size * 2, 0);
  ctx.lineTo(size * 2, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -size * 2);
  ctx.lineTo(0, size * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(points[0].x * multiplier, points[0].y * multiplier);

  for (const { x, y } of points) {
    ctx.lineTo(x * multiplier, y * multiplier);
  }

  ctx.closePath();
  ctx.stroke();

  const already = new Set();

  for (const { x, y } of points) {
    const code = `${x}_${y}`;

    if (already.has(code)) {
      console.warn('Duplicate', code);
    }

    already.add(code);

    ctx.beginPath();
    ctx.arc(x * multiplier, y * multiplier, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();

  function printPoints() {
    console.log(points.map(point => `(x:${point.x},y:${point.y})`).join('\n'));
  }
}

diameterInput.addEventListener('change', e => {
  const diameter = Number(e.target.value);

  draw(diameter);
});

let diameter = parseInt(document.location.hash.substr(1));

if (isNaN(diameter)) {
  diameter = 9;
}

draw(diameter);
