import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
import SidebarEmptyState from './SidebarEmptyState';

export default function ChatList({ searchQuery, onImport }) {
  const { chats } = useChat();

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (chats.length === 0) {
    return <SidebarEmptyState onImport={onImport} />;
  }

  return (
    <div className="chat-list" role="list" aria-label="Imported chats">
      {filteredChats.map(chat => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
