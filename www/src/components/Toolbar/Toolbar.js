import React, { PureComponent } from 'react';

import './Toolbar.scss';

import gameState from '../../gameState';

export default class Toolbar extends PureComponent {
  onBuildClick = () => {
    gameState.toggleDialog('buildMenu');
  };

  render() {
    return (
      <div className="toolbar">
        <i
          className="toolbar__action toolbar__action_build"
          title="Build menu"
          onClick={this.onBuildClick}
        />
      </div>
    );
  }
}
