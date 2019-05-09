import gameState from '../gameState';

const WORLD_CHUNK_SIZE = 1000;
const CHUNK_SIZE = 100;
const SUB = 10;

export function drawGrid(ctx, pos) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';

  const screenLeft = gameState.project({ x: 0, y: 0 }).x;
  const screenRight = gameState.project({ x: gameState.width, y: 0 }).x;
  const screenWidth = Math.abs(screenRight - screenLeft);

  const screenTop = gameState.project({ x: gameState.width / 2, y: 0 }).y;
  const screenBottom = gameState.project({
    x: gameState.width / 2,
    y: gameState.height,
  }).y;
  const screenHeight = Math.abs(screenTop - screenBottom);

  const x1 = Math.floor((pos.x - screenWidth / 2) / CHUNK_SIZE) * CHUNK_SIZE;
  const x2 = Math.ceil((pos.x + screenWidth / 2) / CHUNK_SIZE) * CHUNK_SIZE;

  const y1 = Math.floor((pos.y - screenHeight / 2) / CHUNK_SIZE) * CHUNK_SIZE;
  const y2 = Math.ceil((pos.y + screenHeight / 2) / CHUNK_SIZE) * CHUNK_SIZE;

  for (let x = x1; x <= x2; x += CHUNK_SIZE) {
    const isLast = x + CHUNK_SIZE > x2;

    if (isLast) {
      drawLine(ctx, { x, y: y1, z: 0 }, { x, y: y2, z: 0 }, true);
    } else {
      for (let i = 0; i < SUB; i++) {
        const xx = x + (CHUNK_SIZE * i) / SUB;
        drawLine(ctx, { x: xx, y: y1, z: 0 }, { x: xx, y: y2, z: 0 }, i === 0);
      }
    }
  }

  for (let y = y1; y <= y2; y += CHUNK_SIZE) {
    const isLast = y + CHUNK_SIZE > y2;

    if (isLast) {
      drawLine(ctx, { x: x1, y, z: 0 }, { x: x2, y, z: 0 }, true);
    } else {
      for (let i = 0; i < SUB; i++) {
        const yy = y + (CHUNK_SIZE * i) / SUB;
        drawLine(ctx, { x: x1, y: yy, z: 0 }, { x: x2, y: yy, z: 0 }, i === 0);
      }
    }
  }

  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';

  for (let x = x1; x < x2; x += CHUNK_SIZE) {
    for (let y = y1; y < y2; y += CHUNK_SIZE) {
      const point = gameState.getScreenCoords({ x, y });

      ctx.fillText(`(${x},${y})`, point.x + 2, point.y + 2);

      const chunkId = positionToChunkId({ x, y });

      const point2 = gameState.getScreenCoords({
        x: x + CHUNK_SIZE / 2,
        y: y + CHUNK_SIZE / 2,
      });

      ctx.save();
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(251,196,11,0.8)';
      ctx.fillText(chunkId, point2.x, point2.y);
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawLine(ctx, p1, p2, isStrong) {
  const p1n = gameState.getScreenCoords(p1);
  const p2n = gameState.getScreenCoords(p2);

  if (
    Number.isFinite(p1n.x) &&
    Number.isFinite(p1n.y) &&
    Number.isFinite(p2n.x) &&
    Number.isFinite(p2n.y)
  ) {
    ctx.strokeStyle = isStrong
      ? 'rgba(255,255,255,0.4)'
      : 'rgba(255,255,255,0.25)';

    ctx.beginPath();
    ctx.moveTo(p1n.x, p1n.y);
    ctx.lineTo(p2n.x, p2n.y);
    ctx.stroke();
  }
}

export function positionToChunkId({ x, y }) {
  if (x < 0 || y < 0) {
    throw new Error(`Invalid position: {x:${x},y:${y}}`);
  }

  const m = Math.floor(x / CHUNK_SIZE);
  const n = Math.floor(y / CHUNK_SIZE);

  return n * WORLD_CHUNK_SIZE + m;
}

export function drawZone(ctx, { x, y }, size) {
  const p1 = {
    x: Math.floor(x - (size.x * 10) / 2),
    y: Math.floor(y - (size.y * 10) / 2),
  };

  const p2 = {
    x: p1.x + size.x * 10,
    y: p1.y + size.y * 10,
  };

  const s1 = gameState.getScreenCoords(p1);
  const s2 = gameState.getScreenCoords({
    x: p2.x,
    y: p1.y,
  });
  const s3 = gameState.getScreenCoords(p2);
  const s4 = gameState.getScreenCoords({
    x: p1.x,
    y: p2.y,
  });

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y);
  ctx.lineTo(s3.x, s3.y);
  ctx.lineTo(s4.x, s4.y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
  ctx.fill();
  ctx.restore();
}

export function drawRadius() {
  // TODO:
}
