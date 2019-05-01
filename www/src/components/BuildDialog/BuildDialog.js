import React, { PureComponent } from 'react';

import './BuildDialog.scss';

import gameState from '../../gameState';
import { client } from '../../utils/Client';
import Dialog from '../Dialog';

export default class BuildDialog extends PureComponent {
  state = {
    object: gameState.target.object,
  };

  componentDidMount() {
    gameState.comp.buildDialog = this;
  }

  componentWillUnmount() {
    gameState.comp.buildDialog = null;
  }

  onPutClick = ({ type, have, need }) => {
    const { object } = this.state;

    client().send('putResources', {
      buildingId: object.id,
      chunkId: object.chunkId,
      resources: [
        {
          type,
          amount: need - have,
        },
      ],
    });
  };

  onBuildClick = () => {
    const { object } = this.state;

    client().send('transformToBuild', {
      buildingId: object.id,
      chunkId: object.chunkId,
    });

    client().send('startBuild', {
      buildingId: object.id,
      chunkId: object.chunkId,
    });

    gameState.toggleDialog('buildDialog', false);
  };

  onCloseClick = () => {
    gameState.toggleDialog('buildDialog', false);
  };

  render() {
    const { object } = this.state;
    const { resources } = object.meta;

    const needs = [];
    let allowBuild = true;

    for (const type of Object.keys(resources)) {
      const res = resources[type];

      needs.push({
        type,
        have: res.have,
        need: res.need,
      });

      if (res.have < res.need) {
        allowBuild = false;
      }
    }

    return (
      <Dialog
        className="build-dialog"
        title="Build Dialog"
        onCloseClick={this.onCloseClick}
      >
        <ul className="build-dialog__content">
          {needs.map(need => (
            <li key={need.type} className="build-dialog__item">
              <span className="build-dialog__item-title">{need.type}</span>
              <span className="build-dialog__item-count">
                <span className="build-dialog__current">{need.have}</span>/
                {need.need}
              </span>
              <span className="build-dialog__item-actions">
                <button
                  disabled={need.have >= need.need}
                  onClick={() => this.onPutClick(need)}
                >
                  Put
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="build-dialog__footer">
          <button
            disabled={!allowBuild}
            className="build-dialog__build-btn"
            onClick={this.onBuildClick}
          >
            Build
          </button>
        </div>
      </Dialog>
    );
  }
}
