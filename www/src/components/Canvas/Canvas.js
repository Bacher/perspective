import React, { PureComponent, createRef } from 'react';

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
      const { meta } = gameState.cursor;

      let size;

      switch (meta.building) {
        case 'lumber-mill':
          size = { x: 5, y: 5 };
          break;
        default:
          console.error(`Invalid building: [${meta.building}]`);
      }

      if (size) {
        const { position } = gameState.cursor;

        drawZone(
          ctx,
          {
            x: Math.floor(position.x / 10) * 10,
            y: Math.floor(position.y / 10) * 10,
          },
          size
        );
      }
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
