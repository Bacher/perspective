import React, { PureComponent } from 'react';

import './BuildMenu.scss';

import gameState from '../../gameState';
import Dialog from '../Dialog';

export default class BuildMenu extends PureComponent {
  onItemClick = () => {
    gameState.toggleDialog('buildMenu', false);

    gameState.setCursorMode('build', {
      building: 'lumber-mill',
    });
  };

  onCloseClick = () => {
    gameState.toggleDialog('buildMenu', false);
  };

  render() {
    return (
      <Dialog
        className="build-menu"
        title="Build menu"
        onCloseClick={this.onCloseClick}
      >
        <ul className="build-menu__list">
          <li className="build-menu__item" onClick={this.onItemClick}>
            Lumber mill
          </li>
        </ul>
      </Dialog>
    );
  }
}
