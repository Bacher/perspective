import React, { PureComponent } from 'react';
import throttle from 'lodash.throttle';

import './ChatInput.scss';

import { client } from '../../utils/Client';

export default class ChatInput extends PureComponent {
  componentWillUnmount() {
    this.sendToServerLazy.cancel();

    client().send('chatMessage', {
      text: null,
    });
  }

  onChange = e => {
    const text = e.target.value;

    this.setState({
      text,
    });

    this.sendToServerLazy(text);
  };

  sendToServerLazy = throttle(
    text => {
      client().send('chatMessage', {
        text,
      });
    },
    250,
    { leading: false }
  );

  render() {
    return (
      <div className="chat-input">
        <input
          className="chat-input__input"
          autoFocus
          onChange={this.onChange}
        />
      </div>
    );
  }
}
