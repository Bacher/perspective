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

  onPutClick = async (type, amount) => {
    const { object } = this.state;

    try {
      await client().action('putResources', {
        buildingId: object.id,
        chunkId: object.chunkId,
        resources: [
          {
            type,
            amount,
          },
        ],
      });
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  onBuildClick = async () => {
    const { object } = this.state;

    try {
      await client().action('transformToBuild', {
        buildingId: object.id,
        chunkId: object.chunkId,
      });
    } catch (err) {
      console.error('Transform failed:', err);
      return;
    }

    gameState.toggleDialog('buildDialog', false);

    client().send('build', {
      buildingId: object.id,
      chunkId: object.chunkId,
    });
  };

  onCloseClick = () => {
    gameState.toggleDialog('buildDialog', false);
  };

  renderItem = need => {
    const have = gameState.inventory[need.type] || 0;
    const putAmount = Math.min(have, need.need - need.have);

    return (
      <li key={need.type} className="build-dialog__item">
        <span className="build-dialog__item-title">{need.type}</span>
        <span className="build-dialog__item-count">
          <span className="build-dialog__current">{need.have}</span>/{need.need}
        </span>
        <span className="build-dialog__have">({have})</span>
        {need.have < need.need ? (
          <span className="build-dialog__item-actions">
            <button
              disabled={putAmount === 0}
              onClick={() => this.onPutClick(need.type, putAmount)}
            >
              Put{putAmount ? ` ${putAmount}` : null}
            </button>
          </span>
        ) : null}
      </li>
    );
  };

  render() {
    const { object } = this.state;

    if (!object.meta || !object.meta.resources) {
      setTimeout(() => {
        gameState.toggleDialog('buildDialog', false);
      });
      return null;
    }

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
        <ul className="build-dialog__content">{needs.map(this.renderItem)}</ul>
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
