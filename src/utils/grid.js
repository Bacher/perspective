import state from '../state';

export function drawGrid(ctx, pos) {
  ctx.save();
  ctx.strokeStyle = '#ddd';

  const width = 400;
  const widthD2 = width / 2;

  const height = 300;
  const heightD2 = height / 2;

  const dX = Math.round(pos.x / 10) * 10;
  const dY = Math.round(pos.y / 10) * 10;

  for (let x = dX - widthD2; x <= dX + widthD2; x += 10) {
    drawLine(ctx, { x, y: dY - heightD2, z: 0 }, { x, y: dY + heightD2, z: 0 });
  }

  for (let y = dY - heightD2; y <= dY + heightD2; y += 10) {
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
