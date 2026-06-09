import React, { useState, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatPanel from './components/Chat/ChatPanel';
import NameModal from './components/Modals/NameModal';
import DropOverlay from './components/Modals/DropOverlay';
import WrappedSetup from './components/Wrapped/WrappedSetup';
import WrappedViewer from './components/Wrapped/WrappedViewer';

export default function App() {
  const { isNameModalOpen, handleFileSelect, activeId } = useChat();
  const [route, setRoute] = useState({
    hash: window.location.hash,
    pathname: window.location.pathname
  });
  
  // Wrapped state
  const [wrappedChatId, setWrappedChatId] = useState(null);
  const [wrappedMyName, setWrappedMyName] = useState(null);
  const [wrappedCustomNames, setWrappedCustomNames] = useState({});

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute({
        hash: window.location.hash,
        pathname: window.location.pathname
      });
    };
    
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleStartWrapped = (chatId, myName, customNames) => {
    setWrappedChatId(chatId);
    setWrappedMyName(myName);
    setWrappedCustomNames(customNames);
  };

  const handleCloseWrapped = () => {
    setWrappedChatId(null);
    setWrappedMyName(null);
    setWrappedCustomNames({});
    if (window.location.pathname === '/wrapped') {
      window.history.pushState(null, '', '/');
      setRoute({ hash: '', pathname: '/' });
    } else {
      window.location.hash = ''; // Clear hash to exit wrapped mode
    }
  };

  return (
    <>
      <DropOverlay onDrop={handleFileSelect} />
      {isNameModalOpen && <NameModal />}
      
      {(route.hash === '#/wrapped' || route.pathname === '/wrapped') ? (
        (wrappedChatId && wrappedMyName !== null) ? (
          <WrappedViewer 
            chatId={wrappedChatId} 
            myName={wrappedMyName} 
            customNames={wrappedCustomNames}
            onClose={handleCloseWrapped} 
          />
        ) : (
          <WrappedSetup onStart={handleStartWrapped} />
        )
      ) : (
        <div id="app" className="app">
          <Sidebar 
            isMobileHidden={!!activeId} 
          />
          
          <ChatPanel 
            isMobileOpen={!!activeId} 
          />
        </div>
      )}
    </>
  );
}
