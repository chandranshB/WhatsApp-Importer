/**
 * storage.js — localStorage Manager
 * Stores chats, scroll positions, theme preference.
 * Handles QuotaExceededError gracefully.
 * ChatView – WhatsApp Chat Reader
 */

'use strict';

const Storage = (() => {

  const KEYS = {
    CHAT_LIST:  'chatview_chats',       // Array of chat metadata
    CHAT_DATA:  id => `chatview_data_${id}`,
    SCROLL:     id => `chatview_scroll_${id}`,
    ACTIVE:     'chatview_active',
    THEME:      'chatview_theme',
    MODE:       'chatview_mode',
  };

  // ── Internal helpers ──────────────────────────────────────────────────────

  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        return { ok: false, reason: 'quota' };
      }
      return { ok: false, reason: e.message };
    }
  }

  function _remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }

  // ── Chat List ─────────────────────────────────────────────────────────────

  /**
   * Returns array of chat metadata objects.
   * @returns {ChatMeta[]}
   */
  function listChats() {
    return _get(KEYS.CHAT_LIST) || [];
  }

  /**
   * Save chat metadata to the chat list.
   * @param {ChatMeta} meta
   */
  function _saveMeta(meta) {
    const list = listChats();
    const idx = list.findIndex(c => c.id === meta.id);
    if (idx >= 0) {
      list[idx] = meta;
    } else {
      list.unshift(meta);
    }
    _set(KEYS.CHAT_LIST, list);
  }

  // ── Chat Data ─────────────────────────────────────────────────────────────

  /**
   * Save a full chat (metadata + messages) to localStorage.
   * Returns { ok, reason, storedCount } - storedCount may be less than messages.length if quota hit.
   *
   * Strategy: Try to store all messages. If QuotaExceededError, keep trying without storing data
   * (metadata only saved) and report back.
   *
   * @param {Chat} chat
   * @returns {{ ok: boolean, reason?: string, storedCount: number, quota: boolean }}
   */
  function saveChat(chat) {
    const { messages, ...meta } = chat;

    // Always save metadata list
    _saveMeta({ ...meta, messageCount: messages.length });

    // Try to store full message array
    const result = _set(KEYS.CHAT_DATA(chat.id), messages);

    if (result.ok) {
      return { ok: true, storedCount: messages.length, quota: false };
    }

    // Quota hit — try saving without messages (metadata only, sessions only)
    // The user said "store until localStorage is full" so we try our best.
    // Report back that storage failed.
    return { ok: false, storedCount: 0, quota: true, reason: result.reason };
  }

  /**
   * Load full chat data (messages + meta).
   * @param {string} id
   * @returns {{ meta: ChatMeta, messages: Message[] } | null}
   */
  function loadChat(id) {
    const metas = listChats();
    const meta = metas.find(c => c.id === id);
    if (!meta) return null;

    const messages = _get(KEYS.CHAT_DATA(id)) || [];
    return { meta, messages };
  }

  /**
   * Delete a chat and its associated data.
   * @param {string} id
   */
  function deleteChat(id) {
    const list = listChats().filter(c => c.id !== id);
    _set(KEYS.CHAT_LIST, list);
    _remove(KEYS.CHAT_DATA(id));
    _remove(KEYS.SCROLL(id));
  }

  // ── Scroll Position ───────────────────────────────────────────────────────

  /**
   * Save scroll state for a chat.
   * @param {string} id
   * @param {{ fromIndex: number, scrollTop: number }} state
   */
  function saveScroll(id, state) {
    try {
      localStorage.setItem(KEYS.SCROLL(id), JSON.stringify(state));
    } catch {}
  }

  /**
   * Load scroll state.
   * @param {string} id
   * @returns {{ fromIndex: number, scrollTop: number } | null}
   */
  function loadScroll(id) {
    try {
      const raw = localStorage.getItem(KEYS.SCROLL(id));
      if (raw === null) return null;
      const parsed = JSON.parse(raw);
      // Handle legacy plain-number saves
      if (typeof parsed === 'number') return { fromIndex: null, scrollTop: parsed };
      return parsed;
    } catch {
      return null;
    }
  }

  // ── Active Chat ───────────────────────────────────────────────────────────

  function saveActive(id) { _set(KEYS.ACTIVE, id); }
  function loadActive()   { return _get(KEYS.ACTIVE); }
  function clearActive()  { _remove(KEYS.ACTIVE); }

  // ── Theme ─────────────────────────────────────────────────────────────────

  function saveTheme(name) { _set(KEYS.THEME, name); }
  function loadTheme()     { return _get(KEYS.THEME) || 'whatsapp'; }

  // ── Mode ──────────────────────────────────────────────────────────────────

  function saveMode(mode) { _set(KEYS.MODE, mode); }
  function loadMode()     { return _get(KEYS.MODE) || null; }

  // ── Utilities ─────────────────────────────────────────────────────────────

  /**
   * Generate a short unique ID.
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Estimate available localStorage space in bytes.
   * Not perfectly accurate but gives a rough sense.
   */
  function estimateFreeSpace() {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key) || '';
      used += (key.length + val.length) * 2; // UTF-16 = 2 bytes per char
    }
    const total = 5 * 1024 * 1024; // 5MB typical limit
    return Math.max(0, total - used);
  }

  // Public API
  return {
    listChats,
    saveChat,
    loadChat,
    deleteChat,
    saveScroll,
    loadScroll,
    saveActive,
    loadActive,
    clearActive,
    saveTheme,
    loadTheme,
    saveMode,
    loadMode,
    generateId,
    estimateFreeSpace,
  };

})();
