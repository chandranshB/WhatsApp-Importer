import React from 'react';
import { useChat } from './context/ChatContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatPanel from './components/Chat/ChatPanel';
import NameModal from './components/Modals/NameModal';
import DropOverlay from './components/Modals/DropOverlay';

export default function App() {
  const { isNameModalOpen, handleFileSelect, activeId } = useChat();

  return (
    <>
      <DropOverlay onDrop={handleFileSelect} />
      {isNameModalOpen && <NameModal />}
      
      <div id="app" className="app">
        <Sidebar 
          isMobileHidden={!!activeId} 
        />
        
        <ChatPanel 
          isMobileOpen={!!activeId} 
        />
      </div>
    </>
  );
}
