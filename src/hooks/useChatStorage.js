import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';
import { MediaStorage } from '../utils/mediaStorage';

export function useChatStorage() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    setChats(Storage.listChats());
    const savedActive = Storage.loadActive();
    if (savedActive) {
      openChat(savedActive);
    }
  }, []);

  const openChat = useCallback((id) => {
    const loaded = Storage.loadChat(id);
    if (!loaded) return;
    setActiveId(id);
    Storage.saveActive(id);
    setActiveChat({ meta: loaded.meta, messages: loaded.messages });
  }, []);

  const closeChat = useCallback(() => {
    setActiveId(null);
    setActiveChat(null);
    Storage.clearActive();
  }, []);

  const deleteChat = useCallback(async (id) => {
    Storage.deleteChat(id);
    await MediaStorage.deleteChatMedia(id);
    setChats(Storage.listChats());
    setActiveId((currentId) => {
      if (currentId === id) {
        setActiveChat(null);
        Storage.clearActive();
        return null;
      }
      return currentId;
    });
  }, []);

  const saveNewChat = useCallback((chat) => {
    const result = Storage.saveChat(chat);
    if (!result.ok && result.quota) {
      setStorageWarning(true);
    }
    setChats(Storage.listChats());
    openChat(chat.id);
  }, [openChat]);

  return {
    chats,
    activeId,
    activeChat,
    storageWarning,
    setStorageWarning,
    openChat,
    closeChat,
    deleteChat,
    saveNewChat,
  };
}
