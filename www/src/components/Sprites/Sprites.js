import React, { PureComponent } from 'react';

import './Sprites.scss';

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
    let building = null;

    const { cursor } = gameState;

    if (cursor.mode === 'build') {
      building = (
        <Sprite
          data={{
            type: cursor.meta.building,
            position: {
              x: Math.round(cursor.position.x / 10) * 10,
              y: Math.round(cursor.position.y / 10) * 10,
            },
            size: 5,
            isCentered: true,
            isPassive: true,
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
        {building}
      </div>
    );
  }
}
