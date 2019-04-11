import React from 'react';

import state from '../../state';
import './Sprite.css';

const offsets = {};

export default function Sprite({ type, position, isFixed }) {
  const pos = state.getScreenCoords(position, isFixed);

  const offset = offsets[type] || { x: 16, y: 24 };

  return (
    <img
      className="sprite"
      alt=""
      src={`assets/sprites/${type}.png`}
      style={{
        top: pos.y - offset.y,
        left: pos.x - offset.x,
      }}
    />
  );
}
