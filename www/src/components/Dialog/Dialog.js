import React, { PureComponent } from 'react';
import cn from 'classnames';

import './Dialog.scss';

export default class Dialog extends PureComponent {
  render() {
    const { className, title, children, onCloseClick } = this.props;

    return (
      <div className={cn('dialog', className)}>
        <div className="dialog__title">
          <span className="dialog__title-text">{title}</span>
          <button
            className="dialog__title-close"
            title="close"
            onClick={onCloseClick}
          />
        </div>
        <div className="dialog__content">{children}</div>
      </div>
    );
  }
}
