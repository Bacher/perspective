export function center({ position, size }) {
  if (!size) {
    debugger;
  }

  const centerPosition = {
    x: position.x,
    y: position.y,
  };

  if (size.x % 2 !== 0) {
    centerPosition.x += 5;
  }

  if (size.y % 2 !== 0) {
    centerPosition.y += 5;
  }

  return centerPosition;
}

export function getCollision(obj, p) {
  const c = center(obj);
  const s2 = Math.min(obj.size.x, obj.size.y) * 5 + 5;

  const k = (c.y - p.y) / (c.x - p.x);
  const b = c.y - k * c.x;

  const c1 = {
    x: c.x - s2,
    y: c.y - s2,
  };

  const c2 = {
    x: c.x + s2,
    y: c.y + s2,
  };

  let x;
  let y;

  if (k >= -1 && k <= 1) {
    if (p.x < c.x) {
      y = k * c1.x + b;
      return {
        x: c1.x,
        y: Math.round(y),
      };
    } else {
      y = k * c2.x + b;
      return {
        x: c2.x,
        y: Math.round(y),
      };
    }
  } else {
    if (p.y < c.y) {
      x = (c1.y - b) / k;
      return {
        x: Math.round(x),
        y: c1.y,
      };
    } else {
      x = (c2.y - b) / k;
      return {
        x: Math.round(x),
        y: c2.y,
      };
    }
  }
}
