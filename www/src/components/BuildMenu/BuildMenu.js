import React, { PureComponent } from 'react';

import './BuildMenu.scss';

import gameState from '../../gameState';

export default class BuildMenu extends PureComponent {
  onItemClick = () => {
    gameState.updateUI(ui => ({
      ...ui,
      buildMenu: false,
    }));

    gameState.setCursorMode('build', {
      building: 'lumber-mill',
    });
  };

  render() {
    return (
      <div className="build-menu">
        <ul className="build-menu__list">
          <li className="build-menu__item" onClick={this.onItemClick}>
            Lumber mill
          </li>
        </ul>
      </div>
    );
  }
}
