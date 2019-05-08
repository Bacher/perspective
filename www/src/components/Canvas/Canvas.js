import React, { PureComponent, createRef } from 'react';

import BUILDINGS from '../../constants/buildings';
import gameState from '../../gameState';
import { drawGrid, drawZone } from '../../utils/grid';
import { drawDot } from '../../utils/dot';

import './Canvas.scss';

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

    if (gameState.cursor.mode === 'build') {
      const { meta, position } = gameState.cursor;
      const { size } = BUILDINGS[meta.building];

      drawZone(
        ctx,
        {
          x: Math.floor(position.x / 10) * 10,
          y: Math.floor(position.y / 10) * 10,
        },
        size
      );
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
