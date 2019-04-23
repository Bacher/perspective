import React from 'react';
import cn from 'classnames';

import './Sprite.scss';

import gameState from '../../gameState';
import ChatMessage from '../ChatMessage';

const BASE_CELL_SIZE = 12;

export default function Sprite({ data }) {
  const {
    type,
    position,
    chatMessage,
    playerName,
    isCentered,
    isFixed,
    isPassive,
    opacity,
  } = data;

  const size = data.size || 2;

  const pos = gameState.getScreenCoords(position, isFixed);

  let offset;

  if (isCentered) {
    offset = {
      v: 0.5,
      h: 0.5,
    };
  } else {
    offset = {
      v: 0.75,
      h: 0.5,
    };
  }

  const imgStyles = {
    width: size * BASE_CELL_SIZE,
    height: size * BASE_CELL_SIZE,
    transform: `translate(-${offset.h * 100}%, -${offset.v * 100}%)`,
  };

  if (opacity) {
    imgStyles.opacity = opacity;
  }

  return (
    <i
      className="sprite"
      style={{
        top: pos.y,
        left: pos.x,
      }}
    >
      <img
        className={cn('sprite__img', {
          sprite__img_active: !isPassive,
        })}
        alt=""
        title={type}
        src={`assets/sprites/${type}.png`}
        style={imgStyles}
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
