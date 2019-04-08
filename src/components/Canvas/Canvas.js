import React, { PureComponent, createRef } from 'react';

import state from '../../state';
import { drawGrid } from '../../utils/grid';
import { drawDot } from '../../utils/dot';

import './Canvas.css';

export default class Canvas extends PureComponent {
  canvasRef = createRef();

  componentDidMount() {
    requestAnimationFrame(this.draw);
  }

  draw = () => {
    const ctx = this.canvasRef.current.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, state.width, state.height);

    drawGrid(ctx, state.position);

    for (const dot of state.dots) {
      drawDot(ctx, dot);
    }

    requestAnimationFrame(this.draw);
  };

  render() {
    return (
      <canvas
        className="canvas"
        ref={this.canvasRef}
        width={state.width}
        height={state.height}
      />
    );
  }
}
