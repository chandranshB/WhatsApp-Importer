import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { avatarColor, avatarInitials } from '../Modals/NameModal';

export default function WrappedSetup({ onStart }) {
  const { chats, handleFileSelect } = useChat();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [customNames, setCustomNames] = useState({});
  
  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    if (selectedChat) {
      const names = {};
      selectedChat.participants.forEach(p => {
        names[p] = p || 'Unknown';
      });
      setCustomNames(names);
      if (selectedChat.participants.length > 0) {
        setMyName(selectedChat.participants[0]);
      }
    }
  }, [selectedChat]);

  const triggerImport = () => {
    document.getElementById('wrapped-file-input').click();
  };

  const handleNameChange = (original, newName) => {
    setCustomNames(prev => ({ ...prev, [original]: newName }));
  };

  const handleStart = () => {
    if (selectedChatId && myName !== null) {
      onStart(selectedChatId, myName, customNames);
    }
  };

  return (
    <div className="wrapped-setup-container">
      <div className="wrapped-setup-card">
        <div className="wrapped-setup-header">
          <h1>WhatsApp Wrapped ✨</h1>
          <p>Relive your year in chats. Select a conversation to begin.</p>
        </div>

        {!selectedChatId ? (
          <div className="wrapped-chat-list">
            {chats.length > 0 ? (
              <div className="chat-grid">
                {chats.map(chat => (
                  <button 
                    key={chat.id} 
                    className="chat-select-btn"
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <div className="chat-select-avatar" style={{ background: avatarColor(chat.name || 'U') }}>
                      {avatarInitials(chat.name || 'U')}
                    </div>
                    <div className="chat-select-info">
                      <div className="chat-select-name">{chat.name || 'Unnamed Chat'}</div>
                      <div className="chat-select-meta">{chat.messageCount.toLocaleString()} messages</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="wrapped-empty-state">
                <div className="empty-icon">📁</div>
                <p>No chats imported yet.</p>
              </div>
            )}
            
            <button className="btn btn--ghost w-full mt-4" onClick={triggerImport}>
              Import New Chat
            </button>
            <input 
              type="file" 
              id="wrapped-file-input" 
              accept=".txt,.zip" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                e.target.value = null;
              }}
            />
          </div>
        ) : (
          <div className="wrapped-identity-setup">
            <button className="back-btn" onClick={() => setSelectedChatId(null)}>
              ← Back to chats
            </button>
            
            <h3>Who is who?</h3>
            <p>Select your name and edit the display names if you want to keep them private or add nicknames.</p>
            
            <div className="participant-radio-group mt-4">
              {selectedChat?.participants.map(p => (
                <label key={p} className="participant-option">
                  <input 
                    type="radio" 
                    name="my-name" 
                    value={p}
                    checked={myName === p}
                    onChange={(e) => setMyName(e.target.value)}
                  />
                  <div className="participant-option__avatar" style={{ background: avatarColor(p || 'U') }}>
                    {avatarInitials(p || 'U')}
                  </div>
                  <div className="participant-option__info">
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ padding: '6px 10px', fontSize: '1rem', marginTop: '4px', background: 'rgba(255,255,255,0.1)' }}
                      value={customNames[p] || ''}
                      onChange={(e) => handleNameChange(p, e.target.value)}
                      onClick={(e) => e.preventDefault()}
                      placeholder={p || 'Enter a name'}
                    />
                    <div className="participant-option__count mt-2" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {myName === p ? '⭐ This is you' : 'The other person'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button 
              className="btn btn--primary btn--lg w-full mt-6 wrapped-start-btn" 
              disabled={!myName || !customNames[myName]}
              onClick={handleStart}
            >
              Generate My Wrapped ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
