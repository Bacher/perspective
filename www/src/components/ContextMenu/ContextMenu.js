import React, { PureComponent } from 'react';

import './ContextMenu.scss';

import gameState from '../../gameState';

export default class ContextMenu extends PureComponent {
  componentDidMount() {
    gameState.comp.contextMenu = this;
  }

  onClick = (e, item) => {
    e.preventDefault();
    const { onClick } = this.props;
    onClick(item);
  };

  render() {
    if (!gameState.contextMenu) {
      return null;
    }

    const { position, items } = gameState.contextMenu;

    return (
      <ul
        className="context-menu"
        style={{ top: position.y, left: position.x }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            className="context-menu__item"
            onClick={e => this.onClick(e, item)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    );
  }
}
