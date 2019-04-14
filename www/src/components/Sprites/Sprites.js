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
        {Array.from(state.sprites.values()).map(sprite =>
          sprite.isHidden ? null : <Sprite key={sprite.id} data={sprite} />
        )}
      </div>
    );
  }
}
