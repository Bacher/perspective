const WORLD_CHUNK_SIZE = 1000;
const CHUNK_SIZE = 100;

export function positionToChunkId({ x, y }) {
  if (x < 0 || y < 0) {
    throw new Error(`Invalid position: {x:${x},y:${y}}`);
  }

  const m = Math.floor(x / CHUNK_SIZE);
  const n = Math.floor(y / CHUNK_SIZE);

  return n * WORLD_CHUNK_SIZE + m;
}

export function getAroundChunks(chunkId, radius) {
  const chunks = [];

  const n = Math.floor(chunkId / WORLD_CHUNK_SIZE);
  const m = chunkId - n * WORLD_CHUNK_SIZE;

  for (let mm = m - radius; mm <= m + radius; mm++) {
    let mmm = mm;

    if (mmm < 0) {
      mmm += WORLD_CHUNK_SIZE;
    }

    if (mmm > WORLD_CHUNK_SIZE) {
      mmm -= WORLD_CHUNK_SIZE;
    }

    for (let nn = n - radius; nn <= n + radius; nn++) {
      if (nn >= 0 && nn < WORLD_CHUNK_SIZE) {
        chunks.push(nn * WORLD_CHUNK_SIZE + mmm);
      }
    }
  }

  return chunks;
}
