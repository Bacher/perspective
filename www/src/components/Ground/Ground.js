import React, { PureComponent } from 'react';

import './Ground.scss';

import gameState from '../../gameState';

const COORDS_FACTOR = 1.3;

export default class Ground extends PureComponent {
  componentDidMount() {
    gameState.comp.ground = this;
  }

  render() {
    const pos = gameState.position;

    const coords = {
      x: pos.x * COORDS_FACTOR,
      y: pos.y * COORDS_FACTOR,
    };

    return (
      <div className="ground">
        <div
          className="ground__inner"
          style={{
            backgroundPosition: `${-coords.x}px ${-coords.y}px`,
          }}
        />
      </div>
    );
  }
}
