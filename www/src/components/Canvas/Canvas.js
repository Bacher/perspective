import React, { PureComponent, createRef } from 'react';

import './Canvas.scss';

import BUILDINGS from '../../constants/buildings';
import gameState from '../../gameState';
import { drawGrid, drawZone, drawRadius } from '../../utils/grid';
import { drawDot } from '../../utils/dot';
import { normalizeBySize } from '../../utils/coords';

export default class Canvas extends PureComponent {
  canvasRef = createRef();

  componentDidMount() {
    requestAnimationFrame(this.draw);
  }

  draw = () => {
    const ctx = this.canvasRef.current.getContext('2d');

    ctx.clearRect(0, 0, gameState.width, gameState.height);

    drawGrid(ctx, gameState.position);

    for (const dot of gameState.dots) {
      drawDot(ctx, dot);
    }

    if (gameState.hoverObject) {
      const info = BUILDINGS[gameState.hoverObject.type];

      if (info && info.radius) {
        drawRadius(ctx, gameState.hoverObject, info.radius);
      }
    }

    if (gameState.cursor.mode === 'build') {
      const { meta, position } = gameState.cursor;
      const { size } = BUILDINGS[meta.building];

      drawZone(ctx, normalizeBySize(position, size), size);
    }

    requestAnimationFrame(this.draw);
  };

  render() {
    return (
      <canvas
        className="canvas"
        ref={this.canvasRef}
        width={gameState.width}
        height={gameState.height}
      />
    );
  }
}
