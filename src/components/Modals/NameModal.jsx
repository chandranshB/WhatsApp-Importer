import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { WhatsAppParser } from '../../utils/parser';

// Use same avatar hashing from parser or a utility.
const AVATAR_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC300', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722',
  '#607D8B', '#8BC34A', '#FF4081', '#7C4DFF', '#00BFA5',
];

export function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function avatarInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function NameModal() {
  const { pendingParse, confirmName, setNameModalOpen } = useChat();
  const [selectedName, setSelectedName] = useState(pendingParse?.participants[0]?.name || '');
  const [chatName, setChatName] = useState(
    pendingParse?.filename.replace(/WhatsApp Chat with |WhatsApp Chat - /i, '').replace(/\.txt|\.zip/i, '').trim() || ''
  );

  if (!pendingParse) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={() => setNameModalOpen(false)}></div>
      <div className="modal__card">
        <div className="modal__header">
          <div className="modal__icon">💬</div>
          <h2 className="modal__title">Who's in this chat?</h2>
          <p className="modal__subtitle">Select which name is <strong>you</strong> (the one who exported the chat), and we'll set the other side accordingly.</p>
        </div>
        <div className="modal__body">
          <div className="name-setup">
            <div className="name-setup__participants">
              <p className="name-setup__section-label">Which one is you?</p>
              <div className="participant-radio-group">
                {pendingParse.participants.map(p => (
                  <label key={p.name} className="participant-option">
                    <input 
                      type="radio" 
                      name="my-name" 
                      value={p.name}
                      checked={selectedName === p.name}
                      onChange={(e) => setSelectedName(e.target.value)}
                    />
                    <div className="participant-option__avatar" style={{ background: avatarColor(p.name) }}>
                      {avatarInitials(p.name)}
                    </div>
                    <div className="participant-option__info">
                      <div className="participant-option__name">{p.name}</div>
                      <div className="participant-option__count">{p.count.toLocaleString()} messages</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="name-setup__chat-name-wrap">
              <label className="form-label" htmlFor="modal-chat-name-input">Chat name</label>
              <input
                type="text"
                id="modal-chat-name-input"
                className="form-input"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter a name for this chat"
                maxLength="80"
              />
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={() => setNameModalOpen(false)}>Cancel</button>
          <button className="btn btn--primary" onClick={() => confirmName(selectedName, chatName)}>Open Chat</button>
        </div>
      </div>
    </div>
  );
}
