import React, { PureComponent } from 'react';

import './Inventory.scss';

import gameState from '../../gameState';

export default class Inventory extends PureComponent {
  onCloseClick = () => {
    gameState.updateUI(ui => ({
      ...ui,
      inventory: false,
    }));
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
      <div className="inventory">
        <div className="inventory__title">
          <span className="inventory__title-text">Inventory</span>
          <button
            className="inventory__title-close"
            title="close"
            onClick={this.onCloseClick}
          />
        </div>
        <ul className="inventory__list">
          {this.renderItem('coal')}
          {this.renderItem('metal')}
        </ul>
      </div>
    );
  }
}
