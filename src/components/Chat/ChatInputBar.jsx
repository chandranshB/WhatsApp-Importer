import React from 'react';
import { Plus, Smile, Camera, Mic, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function ChatInputBar() {
  const { theme } = useChat();

  return (
    <div className="chat-input-bar">
      <div className="input-bar-inner">
        <button className="chat-input-btn btn-plus" disabled>
          <Plus size={24} />
        </button>
        <div className="chat-input-wrapper">
          <button className="chat-input-btn btn-emoji" disabled>
            <Smile size={24} />
          </button>
          <input type="text" className="chat-input" placeholder="Message" disabled />
          {theme === 'imessage' && (
            <button className="chat-input-btn btn-imessage-send" disabled>
              <Send size={16} />
            </button>
          )}
          <button className="chat-input-btn btn-camera" disabled>
            <Camera size={22} />
          </button>
        </div>
        {theme !== 'imessage' && (
          <button className="chat-input-btn btn-wa-mic" disabled>
            <Mic size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
