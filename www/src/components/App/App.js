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
    if (e.defaultPrevented) {
      return;
    }

    gameState.target = null;

    const canvasCoords = gameState.normalizeCoords({
      x: e.clientX,
      y: e.clientY,
    });

    const point = gameState.project(canvasCoords);

    if (gameState.cursor.mode === 'build') {
      const position = {
        x: Math.floor(point.x / 10) * 10,
        y: Math.floor(point.y / 10) * 10,
      };

      client().send('createBuildingFrame', {
        position,
        building: gameState.cursor.meta.building,
      });
      gameState.setCursorMode('default');
    } else {
      const position = {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };

      client().send('moveTo', {
        position,
      });
    }

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
        }));
        gameState.hideAllDialogs();
        break;

      case 'Enter':
        gameState.updateUI(ui => ({
          ...ui,
          chat: true,
        }));
        break;

      case 'KeyI':
        if (!gameState.ui.chat) {
          gameState.toggleDialog('inventory');
        }
        break;

      case 'KeyB':
        if (!gameState.ui.chat) {
          gameState.toggleDialog('buildMenu');
        }
        break;

      default:
    }
  };

  onContextMenu = e => {
    e.preventDefault();
    gameState.setCursorMode('default');
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
