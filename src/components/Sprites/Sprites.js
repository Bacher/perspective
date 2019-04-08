import React, { PureComponent } from 'react';

import state from '../../state';
import Sprite from '../Sprite';

export default class Sprites extends PureComponent {
  componentDidMount() {
    state.registerSpritesComponent(this);
  }

  render() {
    return (
      <div>
        {state.sprites.map(sprite => (
          <Sprite
            key={sprite.id}
            name={sprite.name}
            position={sprite.position}
            isFixed={sprite.isFixed}
          />
        ))}
      </div>
    );
  }
}
