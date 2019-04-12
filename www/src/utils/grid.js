import state from '../state';

const CELL_SIZE = 10;

export function drawGrid(ctx, pos) {
  ctx.save();
  ctx.strokeStyle = '#ddd';

  const widthD2 = state.width / 2;
  const heightD2 = state.height / 2;

  const dX = Math.round(pos.x / CELL_SIZE) * CELL_SIZE;
  const dY = Math.round(pos.y / CELL_SIZE) * CELL_SIZE;

  for (let x = dX - widthD2; x <= dX + widthD2; x += CELL_SIZE) {
    drawLine(ctx, { x, y: dY - heightD2, z: 0 }, { x, y: dY + heightD2, z: 0 });
  }

  for (let y = dY - heightD2; y <= dY + heightD2; y += CELL_SIZE) {
    drawLine(ctx, { x: dX - widthD2, y, z: 0 }, { x: dX + widthD2, y, z: 0 });
  }

  ctx.restore();
}

function drawLine(ctx, p1, p2) {
  const p1n = state.getScreenCoords(p1);
  const p2n = state.getScreenCoords(p2);

  if (
    Number.isFinite(p1n.x) &&
    Number.isFinite(p1n.y) &&
    Number.isFinite(p2n.x) &&
    Number.isFinite(p2n.y)
  ) {
    ctx.beginPath();
    ctx.moveTo(p1n.x, p1n.y);
    ctx.lineTo(p2n.x, p2n.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p1n.x, p1n.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
  }
}
