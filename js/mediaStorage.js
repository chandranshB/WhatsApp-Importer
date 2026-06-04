/**
 * mediaStorage.js — IndexedDB Manager for Media
 * Stores Blobs associated with chats so media persists across sessions.
 * ChatView – WhatsApp Chat Reader
 */

'use strict';

const MediaStorage = (() => {

  const DB_NAME = 'ChatViewMediaDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'mediaStore';

  let _dbPromise = null;

  function _getDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Key path will be a composite: "chatId|filename"
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e) => {
        resolve(e.target.result);
      };

      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        reject(e);
      };
    });
    return _dbPromise;
  }

  /**
   * Save a blob to IndexedDB.
   * @param {string} chatId 
   * @param {string} filename 
   * @param {Blob} blob 
   * @returns {Promise<void>}
   */
  async function saveMedia(chatId, filename, blob) {
    try {
      const db = await _getDB();
      const key = `${chatId}|${filename}`;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Failed to save media to IDB:', e);
    }
  }

  /**
   * Load a blob from IndexedDB.
   * @param {string} chatId 
   * @param {string} filename 
   * @returns {Promise<Blob|null>}
   */
  async function loadMedia(chatId, filename) {
    try {
      const db = await _getDB();
      const key = `${chatId}|${filename}`;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Failed to load media from IDB:', e);
      return null;
    }
  }

  /**
   * Delete all media associated with a given chat ID.
   * @param {string} chatId 
   * @returns {Promise<void>}
   */
  async function deleteChatMedia(chatId) {
    try {
      const db = await _getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.openCursor();
        const prefix = `${chatId}|`;

        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            if (cursor.key.startsWith(prefix)) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Failed to delete chat media from IDB:', e);
    }
  }

  return { saveMedia, loadMedia, deleteChatMedia };

})();
