import React, { PureComponent } from 'react';

import './App.css';

import gameState from '../../gameState';
import { client } from '../../utils/Client';
import Canvas from '../Canvas';
import Sprites from '../Sprites';
import UI from '../UI';

export default class App extends PureComponent {
  componentDidMount() {
    window.addEventListener('click', this.onGlobalClick);
  }

  onGlobalClick = () => {
    gameState.closeContextMenu();
  };

  onClick = e => {
    const point = gameState.project({ x: e.clientX, y: e.clientY });

    client().send('moveTo', {
      position: {
        x: Math.round(point.x),
        y: Math.round(point.y),
      },
    });

    //gameState.moveTo(point);
  };

  onContextMenu = e => {
    e.preventDefault();
    gameState.closeContextMenu();
  };

  render() {
    return (
      <div
        className="container"
        style={{
          width: gameState.width,
          height: gameState.height,
        }}
        onContextMenu={this.onContextMenu}
      >
        <div className="map" onClick={this.onClick}>
          <Canvas />
          <Sprites />
        </div>
        <UI />
      </div>
    );
  }
}
