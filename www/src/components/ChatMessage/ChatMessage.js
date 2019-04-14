import React from 'react';

import './ChatMessage.scss';

export default function ChatMessage({ playerName, chatMessage }) {
  return (
    <div className="chat-message">
      {playerName}: {chatMessage}
    </div>
  );
}
