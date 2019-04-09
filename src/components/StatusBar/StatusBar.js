import React, { PureComponent } from 'react';

import './StatusBar.scss';

const BAR_COLORS = {
  health: '#ff4b4b',
  energy: '#ffb100',
  food: '#31d931',
};

export default class StatusBar extends PureComponent {
  renderBar(type, value) {
    return (
      <li key={type} className="status-bar__line" title={`${type}: ${value}%`}>
        <span className="status-bar__bar-identifier">{type.charAt(0)}</span>
        <span className="status-bar__bar">
          <span
            className="status-bar__bar-filler"
            style={{
              width: `${value}%`,
              backgroundColor: BAR_COLORS[type],
            }}
          />
        </span>
      </li>
    );
  }

  render() {
    return (
      <ul className="status-bar">
        {this.renderBar('health', 78)}
        {this.renderBar('energy', 58)}
        {this.renderBar('food', 98)}
      </ul>
    );
  }
}
