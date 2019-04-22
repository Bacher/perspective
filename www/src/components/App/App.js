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
    window.addEventListener('keydown', this.onKeyDown);

    const box = this.root.current.getBoundingClientRect();

    gameState.viewPortOffset = {
      x: box.x,
      y: box.y,
    };
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onGlobalClick);
    window.removeEventListener('keydown', this.onKeyDown);
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

  onKeyDown = e => {
    if (e.defaultPrevented) {
      return;
    }

    switch (e.code) {
      case 'Escape':
        gameState.closeContextMenu();
        gameState.setCursorMode('default');
        gameState.updateUI(ui => ({
          ...ui,
          chat: false,
          inventory: false,
          buildMenu: false,
        }));
        break;
      case 'Enter':
        gameState.updateUI(ui => ({
          ...ui,
          chat: true,
        }));
        break;

      case 'KeyI':
        if (!gameState.ui.chat) {
          gameState.updateUI(ui => ({
            ...ui,
            inventory: !ui.inventory,
          }));
        }
        break;
      default:
    }
  };

  onContextMenu = e => {
    e.preventDefault();
    gameState.closeContextMenu();
  };

  onMouseMove = e => {
    gameState.setCursorCoords(
      gameState.normalizeCoords({
        x: e.clientX,
        y: e.clientY,
      })
    );
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
        onMouseMove={this.onMouseMove}
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
