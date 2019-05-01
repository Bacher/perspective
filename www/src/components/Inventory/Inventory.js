import React, { PureComponent } from 'react';

import './Inventory.scss';

import gameState from '../../gameState';
import Dialog from '../Dialog';

export default class Inventory extends PureComponent {
  onCloseClick = () => {
    gameState.toggleDialog('inventory', false);
  };

  renderItem(name) {
    return (
      <li key={name} className="inventory__item">
        <i
          className="inventory__item-icon"
          style={{
            backgroundImage: `url("assets/textures/${name}.png")`,
          }}
        />
        <span className="inventory__item-name">{name}</span>
        <span className="inventory__item-quantity">4</span>
      </li>
    );
  }

  render() {
    return (
      <Dialog
        className="inventory"
        title="Inventory"
        onCloseClick={this.onCloseClick}
      >
        <ul className="inventory__list">
          {this.renderItem('coal')}
          {this.renderItem('metal')}
        </ul>
      </Dialog>
    );
  }
}
