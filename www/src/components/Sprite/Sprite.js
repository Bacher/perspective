import React from 'react';
import cn from 'classnames';

import './Sprite.scss';
import gameState from '../../gameState';
import ChatMessage from '../ChatMessage';

const offsets = {};

export default function Sprite({ data }) {
  const { type, position, chatMessage, playerName, isFixed } = data;

  const isBig = type === 'mine';

  const pos = gameState.getScreenCoords(position, isFixed);

  const offset =
    offsets[type] || (isBig ? { x: 32, y: -60 } : { x: 16, y: 24 });

  return (
    <i
      className="sprite"
      style={{
        top: pos.y - offset.y,
        left: pos.x - offset.x,
      }}
    >
      <img
        className={cn('sprite__img', {
          sprite__img_big: isBig,
        })}
        alt=""
        title={type}
        src={`assets/sprites/${type}.png`}
      />
      {playerName && !chatMessage ? (
        <span className="sprite__title">{playerName}</span>
      ) : null}
      {chatMessage ? (
        <ChatMessage playerName={playerName} chatMessage={chatMessage} />
      ) : null}
    </i>
  );
}
