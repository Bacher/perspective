import React, { PureComponent } from 'react';

import './UI.scss';

import gameState from '../../gameState';
import Toolbar from '../Toolbar';
import StatusBar from '../StatusBar';
import ChatInput from '../ChatInput';
import ContextMenu from '../ContextMenu';
import DialogManager from '../DialogManager/DialogManager';

export default class UI extends PureComponent {
  componentDidMount() {
    gameState.comp.ui = this;
  }

  render() {
    return (
      <div className="ui">
        <Toolbar />
        <StatusBar />
        <ContextMenu />
        <DialogManager />
        {gameState.ui.chat ? <ChatInput /> : null}
      </div>
    );
  }
}
