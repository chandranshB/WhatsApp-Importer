import React from 'react';
import { useChat } from '../../context/ChatContext';
import { avatarColor, avatarInitials } from '../Modals/NameModal';
import { Trash2 } from 'lucide-react';

export default function ChatListItem({ chat }) {
  const { activeId, openChat, deleteChat } = useChat();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div 
      className={`chat-item ${chat.id === activeId ? 'active' : ''}`}
      role="listitem"
      onClick={() => openChat(chat.id)}
    >
      <div className="chat-item__avatar" style={{ background: avatarColor(chat.name) }}>
        {avatarInitials(chat.name)}
      </div>
      <div className="chat-item__body">
        <div className="chat-item__row">
          <span className="chat-item__name">{chat.name}</span>
          <span className="chat-item__date">{formatDate(chat.lastDate)}</span>
        </div>
        <div className="chat-item__row">
          <span className="chat-item__preview">{chat.preview || `${chat.messageCount.toLocaleString()} messages`}</span>
          <span className="chat-item__count">{chat.messageCount.toLocaleString()}</span>
          <div className="chat-item__actions">
            <button 
              className="icon-btn icon-btn--danger chat-item__delete" 
              onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
              aria-label="Delete chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
