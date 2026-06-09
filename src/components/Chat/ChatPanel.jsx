import React from 'react';
import { useChat } from '../../context/ChatContext';
import MessageList from './MessageList';
import ChatHeader from './ChatHeader';
import ChatEmptyState from './ChatEmptyState';
import ChatInputBar from './ChatInputBar';

export default function ChatPanel() {
  const { activeChat, activeId, closeChat, deleteChat } = useChat();

  if (!activeChat) {
    return (
      <main id="chat-panel" className="chat-panel">
        <ChatEmptyState />
      </main>
    );
  }

  const { meta, messages } = activeChat;

  return (
    <main id="chat-panel" className="chat-panel">
      <div id="chat-view" className="chat-view">
        <ChatHeader 
          meta={meta} 
          onClose={closeChat} 
          onDelete={() => deleteChat(activeId)} 
        />

        <div id="messages-container" className="messages-container" role="log" aria-label="Chat messages" aria-live="polite">
          <MessageList messages={messages} myName={meta.myName} />
        </div>

        <ChatInputBar />
      </div>
    </main>
  );
}
