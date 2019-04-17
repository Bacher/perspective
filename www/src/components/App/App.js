import React, { PureComponent, createRef } from 'react';

import './App.scss';

import gameState from '../../gameState';
import { client } from '../../utils/Client';
import Ground from '../Ground';
import Canvas from '../Canvas';
import Sprites from '../Sprites';
import UI from '../UI';

export default class App extends PureComponent {
  root = createRef();

  componentDidMount() {
    window.addEventListener('click', this.onGlobalClick);

    const box = this.root.current.getBoundingClientRect();

    gameState.viewPortOffset = {
      x: box.x,
      y: box.y,
    };
  }

  onGlobalClick = () => {
    gameState.closeContextMenu();
  };

  onClick = e => {
    const canvasCoords = gameState.normalizeCoords({
      x: e.clientX,
      y: e.clientY,
    });

    const point = gameState.project(canvasCoords);

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
        ref={this.root}
        className="container"
        style={{
          width: gameState.width,
          height: gameState.height,
        }}
        onContextMenu={this.onContextMenu}
      >
        <div className="map" onClick={this.onClick}>
          <Ground />
          <Canvas />
          <Sprites />
        </div>
        <UI />
      </div>
    );
  }
}
