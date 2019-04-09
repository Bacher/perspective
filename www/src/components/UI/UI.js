import React, { PureComponent } from 'react';

import './UI.scss';
import Inventory from '../Inventory';
import StatusBar from '../StatusBar';

export default class UI extends PureComponent {
  state = {
    isInventoryOpen: false,
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
      case 'KeyI':
        this.setState({
          isInventoryOpen: !this.state.isInventoryOpen,
        });
        break;
    }
  };

  onInventoryClose = () => {
    this.setState({
      isInventoryOpen: false,
    });
  };

  render() {
    const { isInventoryOpen } = this.state;

    return (
      <div className="ui">
        <StatusBar />
        {isInventoryOpen ? <Inventory onClose={this.onInventoryClose} /> : null}
      </div>
    );
  }
}
