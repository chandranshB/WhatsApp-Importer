import React, { createContext, useContext, useCallback } from 'react';
import { useChatStorage } from '../hooks/useChatStorage';
import { useThemeManager } from '../hooks/useThemeManager';
import { useMediaStore } from '../hooks/useMediaStore';
import { useFileImport } from '../hooks/useFileImport';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { theme, mode, toggleTheme, toggleMode } = useThemeManager();
  
  const {
    chats, activeId, activeChat, storageWarning, setStorageWarning,
    openChat, closeChat, deleteChat, saveNewChat
  } = useChatStorage();

  const { mediaStore, addMediaUrls, getMediaUrl } = useMediaStore();

  const {
    handleFileSelect, isNameModalOpen, setNameModalOpen, pendingParse, confirmName
  } = useFileImport(addMediaUrls, saveNewChat);

  // Wrap getMediaUrl to implicitly use activeId
  const getMediaUrlForActiveChat = useCallback((filename) => {
    return getMediaUrl(activeId, filename);
  }, [getMediaUrl, activeId]);

  const getCachedMediaUrl = useCallback((filename) => {
    if (!activeId || !filename) return null;
    const key = `${activeId}|${filename}`;
    return mediaStore.get(key) || null;
  }, [activeId, mediaStore]);

  return (
    <ChatContext.Provider value={{
      chats, activeId, activeChat, theme, mode,
      openChat, closeChat, deleteChat, handleFileSelect,
      toggleTheme, toggleMode, getMediaUrl: getMediaUrlForActiveChat,
      getCachedMediaUrl,
      isNameModalOpen, setNameModalOpen, pendingParse, confirmName,
      storageWarning, setStorageWarning
    }}>
      {children}
    </ChatContext.Provider>
  );
};
