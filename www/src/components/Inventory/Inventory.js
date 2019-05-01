import React, { PureComponent } from 'react';

import './Inventory.scss';

import gameState from '../../gameState';
import Dialog from '../Dialog';

export default class Inventory extends PureComponent {
  componentDidMount() {
    gameState.comp.inventory = this;
  }

  componentWillUnmount() {
    gameState.comp.inventory = null;
  }

  onCloseClick = () => {
    gameState.toggleDialog('inventory', false);
  };

  renderItem(type, count) {
    return (
      <li key={type} className="inventory__item">
        <i
          className="inventory__item-icon"
          style={{
            backgroundImage: `url("assets/textures/${type}.png")`,
          }}
        />
        <span className="inventory__item-name">{type}</span>
        <span className="inventory__item-quantity">{count}</span>
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
          {Object.keys(gameState.inventory).map(type =>
            this.renderItem(type, gameState.inventory[type])
          )}
        </ul>
      </Dialog>
    );
  }
}
