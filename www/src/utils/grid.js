import state from '../state';

const WORLD_CHUNK_SIZE = 1000;
const CHUNK_SIZE = 100;
const SUB = 10;

export function drawGrid(ctx, pos) {
  ctx.save();
  ctx.strokeStyle = '#ddd';

  const screenLeft = state.project({ x: 0, y: 0 }).x;
  const screenRight = state.project({ x: state.width, y: 0 }).x;
  const screenWidth = screenRight - screenLeft;

  const screenTop = state.project({ x: state.width / 2, y: 0 }).y;
  const screenBottom = state.project({ x: state.width / 2, y: state.height }).y;
  const screenHeight = screenTop - screenBottom;

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
  ctx.fillStyle = '#333';

  for (let x = x1; x < x2; x += CHUNK_SIZE) {
    for (let y = y1; y < y2; y += CHUNK_SIZE) {
      const point = state.getScreenCoords({ x, y });

      ctx.fillText(`(${x},${y})`, point.x + 2, point.y - 2);

      const chunkId = positionToChunkId({ x, y });

      const point2 = state.getScreenCoords({
        x: x + CHUNK_SIZE / 2,
        y: y + CHUNK_SIZE / 2,
      });

      ctx.save();
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fbc40b';
      ctx.fillText(chunkId, point2.x, point2.y);
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawLine(ctx, p1, p2, isStrong) {
  const p1n = state.getScreenCoords(p1);
  const p2n = state.getScreenCoords(p2);

  if (
    Number.isFinite(p1n.x) &&
    Number.isFinite(p1n.y) &&
    Number.isFinite(p2n.x) &&
    Number.isFinite(p2n.y)
  ) {
    ctx.strokeStyle = isStrong ? '#888' : ' #ddd';

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
