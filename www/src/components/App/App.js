import React, { PureComponent } from 'react';

import './App.css';

import state from '../../state';
import Canvas from '../Canvas';
import Sprites from '../Sprites';
import UI from '../UI';

export default class App extends PureComponent {
  onClick = e => {
    const { client } = this.props;

    const point = state.project({ x: e.clientX, y: e.clientY });

    client.send('moveTo', {
      position: {
        x: Math.round(point.x),
        y: Math.round(point.y),
      },
    });

    //state.moveTo(point);
  };

  render() {
    return (
      <div
        className="container"
        style={{
          width: state.width,
          height: state.height,
        }}
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
