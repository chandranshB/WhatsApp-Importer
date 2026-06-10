import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { avatarColor, avatarInitials } from '../Modals/NameModal';
import { FaWhatsapp } from 'react-icons/fa';

export default function WrappedSetup({ onStart }) {
  const { chats, handleFileSelect } = useChat();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [customNames, setCustomNames] = useState({});
  
  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    if (selectedChat) {
      const names = {};
      let defaultMe = null;
      selectedChat.participants.forEach(p => {
        names[p] = p || 'Unknown';
        if (!p || p === 'Unknown' || p === '') {
           defaultMe = p;
        }
      });
      setCustomNames(names);
      
      if (defaultMe !== null) {
        setMyName(defaultMe);
      } else if (selectedChat.participants.length > 0) {
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
      // Auto full-screen on mobile devices
      if (window.innerWidth <= 768) {
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen().catch(err => console.log(err));
        } else if (docElm.webkitRequestFullscreen) {
          docElm.webkitRequestFullscreen().catch(err => console.log(err));
        }
      }
      onStart(selectedChatId, myName, customNames);
    }
  };

  return (
    <div className="wrapped-setup-container">
      <div className="wa-setup-main">
        <div className="wa-header">
          {selectedChatId ? (
            <button className="wa-back-btn" onClick={() => setSelectedChatId(null)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"/>
              </svg>
              <span>Setup</span>
            </button>
          ) : (
            <div className="wa-header-brand">
              <FaWhatsapp size={28} color="#00A884" />
              <h1>WhatsApp Wrapped</h1>
            </div>
          )}
        </div>

        <div className="wa-content">
          {!selectedChatId ? (
            <>
              {chats.length > 0 && (
                <>
                  <div className="wa-section-title">CHATS</div>
                  <div className="wa-list">
                    {chats.map(chat => (
                      <div key={chat.id} className="wa-list-item" onClick={() => setSelectedChatId(chat.id)}>
                        <div className="wa-avatar" style={{ background: avatarColor(chat.name || 'U') }}>
                          {avatarInitials(chat.name || 'U')}
                        </div>
                        <div className="wa-item-info">
                          <div className="wa-item-title">{chat.name || 'Unnamed Chat'}</div>
                          <div className="wa-item-subtitle">{chat.messageCount.toLocaleString()} messages</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="wa-list mt-3">
                <div className="wa-list-item" onClick={triggerImport}>
                  <div className="wa-icon-box">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#00A884">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div className="wa-item-info border-none">
                    <div className="wa-item-title text-green">Import New Chat</div>
                  </div>
                </div>
              </div>
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
            </>
          ) : (
            <>
              <div className="wa-section-title">WHICH ONE IS YOU?</div>
              <div className="wa-list">
                {selectedChat?.participants.map(p => (
                  <label key={p} className="wa-list-item">
                    <div className="wa-radio">
                      <input 
                        type="radio" 
                        name="my_name" 
                        value={p} 
                        checked={myName === p} 
                        onChange={() => setMyName(p)}
                      />
                      <div className="wa-radio-custom"></div>
                    </div>
                    <div className="wa-avatar" style={{ background: avatarColor(p || 'U') }}>
                      {avatarInitials(p || 'U')}
                    </div>
                    <div className="wa-item-info border-bottom-only">
                      <div className="wa-item-title">{p || 'Unknown'}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="wa-section-title mt-4">CUSTOMIZE DISPLAY NAMES</div>
              <div className="wa-list">
                {selectedChat?.participants.map(p => (
                  <div key={p} className="wa-list-item no-hover">
                    <div className="wa-avatar" style={{ background: avatarColor(p || 'U') }}>
                      {avatarInitials(p || 'U')}
                    </div>
                    <div className="wa-item-info border-bottom-only">
                      <div className="wa-input-wrapper">
                        <span className="wa-input-label">{myName === p ? 'Your Name' : 'Their Name'}</span>
                        <input 
                          type="text" 
                          className="wa-text-input" 
                          value={customNames[p] || ''}
                          onChange={(e) => handleNameChange(p, e.target.value)}
                          placeholder={p || 'Enter name'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wa-action-container">
                <button 
                  className="wa-fab-btn" 
                  disabled={!myName || !customNames[myName]}
                  onClick={handleStart}
                >
                  Unwrap Our Story
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
