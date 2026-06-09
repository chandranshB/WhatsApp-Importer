import React from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { avatarColor, avatarInitials } from '../Modals/NameModal';

export default function ChatHeader({ meta, onClose, onDelete }) {
  const dateRange = (first, last) => {
    if (!first || !last) return '';
    const f = new Date(first).toLocaleDateString([], { month: 'short', year: 'numeric' });
    const l = new Date(last).toLocaleDateString([], { month: 'short', year: 'numeric' });
    return f === l ? f : `${f} – ${l}`;
  };

  const metaText = `${meta.messageCount.toLocaleString()} messages${dateRange(meta.firstDate, meta.lastDate) ? ' · ' + dateRange(meta.firstDate, meta.lastDate) : ''}`;

  return (
    <header id="chat-header" className="chat-header">
      <button className="icon-btn chat-header__back" onClick={onClose} aria-label="Back to chat list">
        <ChevronLeft size={24} />
      </button>
      <div className="chat-header__avatar" style={{ background: avatarColor(meta.name) }}>
        {avatarInitials(meta.name)}
      </div>
      <div className="chat-header__info">
        <span className="chat-header__name">{meta.name}</span>
        <span className="chat-header__meta">{metaText}</span>
      </div>
      <div className="chat-header__actions">
        <button className="icon-btn icon-btn--danger" onClick={onDelete} aria-label="Delete chat" title="Delete chat">
          <Trash2 size={20} />
        </button>
      </div>
    </header>
  );
}
