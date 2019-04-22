import React, { PureComponent } from 'react';

import './UI.scss';

import gameState from '../../gameState';
import Inventory from '../Inventory';
import Toolbar from '../Toolbar';
import StatusBar from '../StatusBar';
import ChatInput from '../ChatInput';
import ContextMenu from '../ContextMenu';
import BuildMenu from '../BuildMenu/BuildMenu';

export default class UI extends PureComponent {
  componentDidMount() {
    gameState.comp.ui = this;
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    return (
      <div className="ui">
        <Toolbar />
        <StatusBar />
        {gameState.ui.chat ? <ChatInput /> : null}
        {gameState.ui.inventory ? <Inventory /> : null}
        {gameState.ui.buildMenu ? <BuildMenu /> : null}
        <ContextMenu />
      </div>
    );
  }
}
