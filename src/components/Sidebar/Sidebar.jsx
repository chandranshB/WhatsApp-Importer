import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import SidebarHeader from './SidebarHeader';
import SidebarSearch from './SidebarSearch';
import ThemePicker from './ThemePicker';
import ChatList from './ChatList';

export default function Sidebar({ isMobileHidden }) {
  const { handleFileSelect } = useChat();
  const [isThemePickerOpen, setThemePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerImport = () => {
    document.getElementById('hidden-file-input').click();
  };

  return (
    <aside id="sidebar" className={`sidebar ${isMobileHidden ? 'mobile-hidden' : ''}`} aria-label="Chat list">
      <SidebarHeader 
        toggleThemePicker={() => setThemePickerOpen(!isThemePickerOpen)} 
        onImport={triggerImport} 
      />

      <ThemePicker isOpen={isThemePickerOpen} onClose={() => setThemePickerOpen(false)} />

      <SidebarSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ChatList searchQuery={searchQuery} onImport={triggerImport} />

      <input 
        type="file" 
        id="hidden-file-input" 
        accept=".txt,.zip" 
        style={{ display: 'none' }} 
        onChange={(e) => {
          if (e.target.files[0]) handleFileSelect(e.target.files[0]);
          e.target.value = null;
        }}
      />
    </aside>
  );
}
