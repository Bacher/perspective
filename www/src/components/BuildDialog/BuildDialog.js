import React, { PureComponent } from 'react';

import './BuildDialog.scss';

export default class BuildDialog extends PureComponent {
  render() {
    const needs = [
      {
        type: 'wood',
        current: 3,
        total: 100,
      },
    ];

    return (
      <div className="build-dialog">
        <div className="build-dialog__title">Build Dialog</div>
        <ul className="build-dialog__content">
          {needs.map(need => (
            <li key={need.type} className="build-dialog__item">
              <span className="build-dialog__item-title">{need.type}</span>
              <span className="build-dialog__item-count">
                <span className="build-dialog__current">{need.current}</span>/
                {need.total}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
