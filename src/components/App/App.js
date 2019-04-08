import React, { PureComponent } from 'react';

import state from '../../state';
import Canvas from '../Canvas';
import Sprites from '../Sprites';

import './App.css';

export default class App extends PureComponent {
  onClick = e => {
    const point = state.project({ x: e.clientX, y: e.clientY });
    state.sprites[1].position = point;
    state.spritesUpdated();
  };

  render() {
    return (
      <div className="container" onClick={this.onClick}>
        <Canvas />
        <Sprites />
      </div>
    );
  }
}
