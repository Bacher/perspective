import React, { PureComponent } from 'react';

import './UI.scss';
import Inventory from '../Inventory';
import StatusBar from '../StatusBar';
import ChatInput from '../ChatInput';

export default class UI extends PureComponent {
  state = {
    isInventoryOpen: false,
    isChatOpen: false,
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = e => {
    if (e.defaultPrevented) {
      return;
    }

    switch (e.code) {
      case 'Enter': {
        const { isChatOpen } = this.state;

        this.setState({
          isChatOpen: !isChatOpen,
        });
        break;
      }

      case 'KeyI':
        this.setState({
          isInventoryOpen: !this.state.isInventoryOpen,
        });
        break;
      default:
    }
  };

  onInventoryClose = () => {
    this.setState({
      isInventoryOpen: false,
    });
  };

  render() {
    const { isInventoryOpen, isChatOpen } = this.state;

    return (
      <div className="ui">
        <StatusBar />
        {isChatOpen ? <ChatInput /> : null}
        {isInventoryOpen ? <Inventory onClose={this.onInventoryClose} /> : null}
      </div>
    );
  }
}
