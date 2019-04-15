import React, { PureComponent } from 'react';

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
    return (
      <div onContextMenu={this.onContextMenu}>
        {Array.from(gameState.sprites.values()).map(sprite =>
          sprite.isHidden ? null : <Sprite key={sprite.id} data={sprite} />
        )}
      </div>
    );
  }
}
