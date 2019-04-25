import React from 'react';
import cn from 'classnames';

import './Sprite.scss';

import gameState from '../../gameState';
import ChatMessage from '../ChatMessage';

const BASE_CELL_SIZE = 11;

export default function Sprite({ data }) {
  const {
    type,
    position,
    chatMessage,
    playerName,
    isCentered,
    isFixed,
    noAction,
    opacity,
  } = data;

  const size = data.size || { x: 2, y: 2 };

  const centerPosition = {
    x: position.x,
    y: position.y,
  };

  if (size.x % 2 !== 0) {
    centerPosition.x += 5;
  }

  if (size.y % 2 !== 0) {
    centerPosition.y += 5;
  }

  const pos = gameState.getScreenCoords(centerPosition, isFixed);

  let scale = 1;

  if (!isFixed) {
    const posFar = gameState.getScreenCoords(
      {
        x: centerPosition.x,
        y: centerPosition.y - 1,
      },
      isFixed
    );

    scale = Math.pow(pos.y - posFar.y, 0.7);
  }

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
    width: size.x * BASE_CELL_SIZE * scale,
    height: size.y * BASE_CELL_SIZE * scale,
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
          'sprite__img_no-action': noAction,
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
