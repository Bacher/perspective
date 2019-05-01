import React, { PureComponent } from 'react';

import './DialogManager.scss';

import gameState from '../../gameState';
import Inventory from '../Inventory';
import BuildMenu from '../BuildMenu';
import BuildDialog from '../BuildDialog';

const DIALOGS_COMPONENTS = {
  inventory: Inventory,
  buildMenu: BuildMenu,
  buildDialog: BuildDialog,
};

export default class DialogManager extends PureComponent {
  state = {
    order: [],
  };

  componentDidMount() {
    gameState.comp.dialogs = this;
  }

  componentWillUnmount() {
    gameState.comp.dialogs = null;
  }

  onDialogActivity = dialogName => {
    gameState.popDialogToTop(dialogName);
  };

  render() {
    const { dialogsOrder } = gameState;

    return (
      <div className="dialog-manager">
        {dialogsOrder.map((dialogName, i) => {
          const Comp = DIALOGS_COMPONENTS[dialogName];

          return (
            <div
              key={dialogName}
              style={{
                zIndex: i,
              }}
              onMouseDown={() => this.onDialogActivity(dialogName)}
              onClick={() => this.onDialogActivity(dialogName)}
            >
              <Comp />
            </div>
          );
        })}
      </div>
    );
  }
}
