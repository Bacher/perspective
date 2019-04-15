import gameState from '../gameState';

export function drawDot(ctx, dot) {
  const pos = gameState.getScreenCoords(dot.position);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, dot.radius || 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#f00';
  ctx.fill();
}
