import React, { PureComponent } from 'react';

import './BuildMenu.scss';

import gameState from '../../gameState';
import BUILDINGS, { ORDER } from '../../constants/buildings';
import Dialog from '../Dialog';

export default class BuildMenu extends PureComponent {
  onItemClick = id => {
    gameState.toggleDialog('buildMenu', false);

    gameState.setCursorMode('build', {
      building: id,
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
          {ORDER.map(id => {
            const { title } = BUILDINGS[id];

            return (
              <li
                key={id}
                className="build-menu__item"
                onClick={() => this.onItemClick(id)}
              >
                {title}
              </li>
            );
          })}
        </ul>
      </Dialog>
    );
  }
}
