import React from 'react';

import './ChatMessage.scss';

export default function ChatMessage({ chatMessage }) {
  return <div className="chat-message">{chatMessage}</div>;
}
