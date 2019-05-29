export function getCircleShape(diameter) {
  const radius = diameter / 2;
  const oddDiameter = diameter % 2 === 1;

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

  return points;
}
