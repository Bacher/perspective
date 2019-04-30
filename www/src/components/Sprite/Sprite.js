import React from 'react';
import cn from 'classnames';

import './Sprite.scss';

import gameState from '../../gameState';
import ChatMessage from '../ChatMessage';
import { center } from '../../utils/coords';

const BASE_CELL_SIZE = 11;

const offsets = {
  player: {
    h: 0.5,
    v: 0.7,
  },
};

export default function Sprite({ data }) {
  const {
    type,
    chatMessage,
    playerName,
    isFixed,
    noAction,
    opacity,
    meta,
    size,
  } = data;

  const centerPosition = center(data);

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

  const offset = offsets[type] || {
    v: 0.5,
    h: 0.5,
  };

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
      onClick={
        noAction
          ? null
          : e => {
              e.preventDefault();
              gameState.clickToObject(data);
            }
      }
    >
      <img
        className={cn('sprite__img', {
          'sprite__img_no-action': noAction,
        })}
        alt=""
        title={type}
        src={`assets/sprites/${type.replace(/:.*$/, '')}.png`}
        style={imgStyles}
      />
      {type === 'building-frame:in-progress'
        ? renderPercent(meta.percent)
        : null}
      {playerName && !chatMessage ? (
        <span className="sprite__title">{playerName}</span>
      ) : null}
      {chatMessage ? (
        <ChatMessage playerName={playerName} chatMessage={chatMessage} />
      ) : null}
    </i>
  );
}

function renderPercent(percent) {
  const displayPercent = Math.floor(percent * 100);

  return <span className="sprite__build-percent">{displayPercent}%</span>;
}
