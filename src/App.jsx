import React, { useState, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatPanel from './components/Chat/ChatPanel';
import NameModal from './components/Modals/NameModal';
import DropOverlay from './components/Modals/DropOverlay';

export default function App() {
  const { isNameModalOpen, handleFileSelect, activeId } = useChat();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // If a chat is selected on mobile, auto-close sidebar
    if (activeId && window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [activeId]);

  return (
    <>
      <DropOverlay onDrop={handleFileSelect} />
      {isNameModalOpen && <NameModal />}
      
      <div id="app" className="app">
        <div 
          id="mobile-sidebar-overlay" 
          className={`mobile-overlay ${isSidebarOpen ? 'active' : ''}`} 
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
        
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <ChatPanel 
          onOpenSidebar={() => setSidebarOpen(true)} 
        />
      </div>
    </>
  );
}
