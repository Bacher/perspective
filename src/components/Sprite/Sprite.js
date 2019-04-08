import React, { PureComponent } from 'react';

import state from '../../state';
import './Sprite.css';

const offsets = {
  man: {
    x: 16,
    y: 24,
  },
  flag: {
    x: 16,
    y: 24,
  },
};

export default class Sprite extends PureComponent {
  render() {
    const { name, position, isFixed } = this.props;

    const pos = state.getScreenCoords(position, isFixed);

    return (
      <img
        className="sprite"
        alt=""
        src={`assets/sprites/${name}.png`}
        style={{
          top: pos.y - offsets[name].y,
          left: pos.x - offsets[name].x,
        }}
      />
    );
  }
}
