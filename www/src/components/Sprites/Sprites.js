import React, { PureComponent } from 'react';

import './Sprites.scss';

import BUILDINGS from '../../constants/buildings';
import { normalizeBySize } from '../../utils/coords';
import gameState from '../../gameState';
import Sprite from '../Sprite';

export default class Sprites extends PureComponent {
  componentDidMount() {
    gameState.comp.sprites = this;
  }

  onContextMenu = e => {
    if (!e.target.classList.contains('sprite__img')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    gameState.openContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  render() {
    let buildingSprite = null;

    const { cursor } = gameState;

    if (cursor.mode === 'build') {
      const { building } = cursor.meta;
      const { size } = BUILDINGS[building];

      buildingSprite = (
        <Sprite
          data={{
            type: cursor.meta.building,
            position: normalizeBySize(cursor.position, size),
            size,
            noAction: true,
            opacity: 0.7,
          }}
        />
      );
    }

    return (
      <div className="sprites" onContextMenu={this.onContextMenu}>
        {Array.from(gameState.sprites.values()).map(sprite =>
          sprite.isHidden ? null : <Sprite key={sprite.id} data={sprite} />
        )}
        {buildingSprite}
      </div>
    );
  }
}
