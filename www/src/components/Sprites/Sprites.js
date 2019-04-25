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
      const size = {
        x: 5,
        y: 5,
      };

      const position = {
        x: cursor.position.x / 10,
        y: cursor.position.y / 10,
      };

      if (size.x % 2 === 0) {
        position.x = Math.round(position.x) * 10;
      } else {
        position.x = Math.floor(position.x) * 10;
      }

      if (size.y % 2 === 0) {
        position.y = Math.round(position.y) * 10;
      } else {
        position.y = Math.floor(position.y) * 10;
      }

      building = (
        <Sprite
          data={{
            type: cursor.meta.building,
            position,
            size,
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
