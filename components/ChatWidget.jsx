'use client';
import { MessageIcon } from './Icons';

export default function ChatWidget() {
  return (
    <div className="chat-widget">
      <button className="chat-btn">
        <MessageIcon className="chat-icon" />
      </button>
    </div>
  );
}

