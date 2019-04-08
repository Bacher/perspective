import state from '../state';

export function drawDot(ctx, dot) {
  const pos = state.getScreenCoords(dot.position);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, dot.radius || 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#f00';
  ctx.fill();
}
