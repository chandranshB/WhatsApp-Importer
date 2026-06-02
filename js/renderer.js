/**
 * renderer.js — DOM Renderer
 * Renders chat list sidebar items and message bubbles.
 * ChatView – WhatsApp Chat Reader
 */

'use strict';

const Renderer = (() => {

  // ── Avatar Color Palette ──────────────────────────────────────────────────
  const AVATAR_COLORS = [
    '#FF6B6B', '#FF8E53', '#FFC300', '#2ECC71', '#1ABC9C',
    '#3498DB', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722',
    '#607D8B', '#8BC34A', '#FF4081', '#7C4DFF', '#00BFA5',
  ];

  function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function avatarInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // ── Escape HTML ───────────────────────────────────────────────────────────
  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Linkify text ─────────────────────────────────────────────────────────
  const URL_RE = /https?:\/\/[^\s<>"']+/g;

  function linkify(text) {
    return escHtml(text).replace(URL_RE, url => {
      const escaped = escHtml(url);
      return `<a href="${escaped}" target="_blank" rel="noopener noreferrer">${escaped}</a>`;
    });
  }

  // ── Detect emoji-only message ─────────────────────────────────────────────
  const EMOJI_RE = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+$/u;

  function isEmojiOnly(text) {
    return EMOJI_RE.test(text) && text.trim().length <= 12;
  }

  // ── Media Icons ───────────────────────────────────────────────────────────
  const MEDIA_ICONS = {
    image:    '🖼️',
    video:    '📹',
    audio:    '🎵',
    gif:      '🎞️',
    sticker:  '😊',
    document: '📄',
    contact:  '👤',
    media:    '📎',
  };

  // ── Render Chat List ──────────────────────────────────────────────────────

  /**
   * Render the sidebar chat list.
   * @param {ChatMeta[]} chats
   * @param {string|null} activeId
   * @param {Function} onSelect - (id) => void
   * @param {Function} onDelete - (id) => void
   * @returns {HTMLElement} — the chat list container (pre-cleared by caller)
   */
  function renderChatList(chats, activeId, onSelect, onDelete) {
    const container = document.getElementById('chat-list');
    const emptyEl   = document.getElementById('sidebar-empty');

    container.innerHTML = '';

    if (!chats.length) {
      emptyEl.classList.add('visible');
      return;
    }

    emptyEl.classList.remove('visible');

    for (const chat of chats) {
      const item = _createChatItem(chat, activeId, onSelect, onDelete);
      container.appendChild(item);
    }
  }

  function _createChatItem(chat, activeId, onSelect, onDelete) {
    const item = document.createElement('div');
    item.className = 'chat-item' + (chat.id === activeId ? ' active' : '');
    item.setAttribute('role', 'listitem');
    item.dataset.id = chat.id;

    const color = avatarColor(chat.name);
    const initials = avatarInitials(chat.name);
    const date = chat.lastDate ? _formatListDate(new Date(chat.lastDate)) : '';

    item.innerHTML = `
      <div class="chat-item__avatar" style="background:${color}" aria-hidden="true">${escHtml(initials)}</div>
      <div class="chat-item__body">
        <div class="chat-item__row">
          <span class="chat-item__name">${escHtml(chat.name)}</span>
          <span class="chat-item__date">${escHtml(date)}</span>
        </div>
        <div class="chat-item__row">
          <span class="chat-item__preview">${escHtml(chat.preview || `${chat.messageCount.toLocaleString()} messages`)}</span>
          <span class="chat-item__count">${chat.messageCount.toLocaleString()}</span>
          <div class="chat-item__actions">
            <button class="icon-btn icon-btn--danger chat-item__delete" aria-label="Delete ${escHtml(chat.name)}" title="Delete chat">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    item.addEventListener('click', e => {
      if (e.target.closest('.chat-item__delete')) return;
      onSelect(chat.id);
    });

    item.querySelector('.chat-item__delete').addEventListener('click', e => {
      e.stopPropagation();
      onDelete(chat.id);
    });

    return item;
  }

  function _formatListDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }

  // ── Set Active Chat Item ──────────────────────────────────────────────────

  function setActiveChatItem(id) {
    document.querySelectorAll('.chat-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }

  // ── Render Chat Header ────────────────────────────────────────────────────

  function renderChatHeader(chat) {
    const avatarEl = document.getElementById('chat-avatar');
    const nameEl   = document.getElementById('chat-name-display');
    const metaEl   = document.getElementById('chat-meta-display');

    const color    = avatarColor(chat.name);
    const initials = avatarInitials(chat.name);

    avatarEl.textContent = initials;
    avatarEl.style.background = color;
    nameEl.textContent  = chat.name;

    const count = chat.messageCount?.toLocaleString() || '?';
    const range = _dateRange(chat.firstDate, chat.lastDate);
    metaEl.textContent = `${count} messages${range ? ' · ' + range : ''}`;
  }

  function _dateRange(first, last) {
    if (!first || !last) return '';
    const f = new Date(first).toLocaleDateString([], { month: 'short', year: 'numeric' });
    const l = new Date(last).toLocaleDateString([], { month: 'short', year: 'numeric' });
    return f === l ? f : `${f} – ${l}`;
  }

  // ── Render Messages ───────────────────────────────────────────────────────

  const CHUNK_SIZE = 200;
  let _allMessages  = [];
  let _myName       = '';
  let _renderedFrom = 0;
  let _chatId       = null;  // ID of the chat currently rendered
  let _mediaData    = null;  // Map<"chatId|filename", blobURL> set from app

  /** Called by app.js once so renderer can look up blob URLs. */
  function setMediaData(map) { _mediaData = map; }

  /** Return the blob URL for a media file, or null if not available. */
  function _mediaUrl(filename) {
    if (!_mediaData || !_chatId || !filename) return null;
    return _mediaData.get(`${_chatId}|${filename}`) || null;
  }

  /**
   * Render messages with chunking. Optionally start from a specific index.
   * @param {Message[]} messages
   * @param {string} myName
   * @param {number|null} startFrom - if provided, render chunk starting at this index
   */
  function renderMessages(messages, myName, startFrom = null, chatId = null) {
    _allMessages  = messages;
    _myName       = myName;
    _chatId       = chatId;

    if (startFrom !== null && startFrom >= 0 && startFrom < messages.length) {
      _renderedFrom = startFrom;
    } else {
      _renderedFrom = Math.max(0, messages.length - CHUNK_SIZE);
    }

    const inner = document.getElementById('messages-inner');
    inner.innerHTML = '';

    _renderChunk(_renderedFrom, messages.length, inner, false);
    _updateLoadEarlierBtn();
  }

  /** Return the current rendered-from index (for scroll state saving). */
  function getRenderedFrom() { return _renderedFrom; }

  function prependEarlierMessages() {
    const inner = document.getElementById('messages-inner');
    const newFrom = Math.max(0, _renderedFrom - CHUNK_SIZE);
    _renderChunk(newFrom, _renderedFrom, inner, true);
    _renderedFrom = newFrom;
    _updateLoadEarlierBtn();
  }

  function _updateLoadEarlierBtn() {
    const wrap = document.getElementById('load-earlier-wrap');
    if (_renderedFrom > 0) {
      wrap.hidden = false;
    } else {
      wrap.hidden = true;
    }
  }

  /**
   * Render a slice of _allMessages into the container.
   */
  function _renderChunk(from, to, container, prepend) {
    const slice = _allMessages.slice(from, to);
    const fragment = document.createDocumentFragment();
    // Only animate the last N bubbles (visible on screen). Earlier ones appear instantly.
    const ANIMATE_LAST = 30;
    const animateFrom  = slice.length - ANIMATE_LAST;

    let prevDate = null;
    let prevSender = null;
    let prevType = null;

    // If prepending, we need date context from existing content
    if (prepend && container.childElementCount > 0) {
      // No date context needed — we add our own dates
    }

    for (let i = 0; i < slice.length; i++) {
      const msg = slice[i];
      const next = slice[i + 1] || null;

      // Date divider
      const msgDateKey = WhatsAppParser.dateKey(msg.timestamp);
      if (msgDateKey !== prevDate) {
        fragment.appendChild(_createDateDivider(msg.timestamp));
        prevDate = msgDateKey;
        prevSender = null; // Reset grouping on new date
      }

      if (msg.type === 'system') {
        fragment.appendChild(_createSystemMsg(msg));
        prevSender = null;
        prevType = 'system';
        continue;
      }

      // Determine message grouping
      const isFirst = prevSender !== msg.sender || prevType === 'system' || msgDateKey !== WhatsAppParser.dateKey({ timestamp: msg.timestamp });
      const isLast  = !next || next.sender !== msg.sender || next.type === 'system' ||
                      WhatsAppParser.dateKey(next.timestamp) !== msgDateKey;

      const groupClass = isFirst && isLast ? '' :
                         isFirst           ? 'group-top' :
                         isLast            ? 'group-bottom' : 'group-middle';

      const el = _createMessageRow(msg, groupClass, isFirst, i >= animateFrom);
      fragment.appendChild(el);

      prevSender = msg.sender;
      prevType   = 'message';
    }

    if (prepend) {
      container.insertBefore(fragment, container.firstChild);
    } else {
      container.appendChild(fragment);
    }
  }

  function _createDateDivider(date) {
    const div = document.createElement('div');
    div.className = 'date-divider';
    div.innerHTML = `<span class="date-divider__label">${escHtml(WhatsAppParser.formatDateDivider(date))}</span>`;
    return div;
  }

  function _createSystemMsg(msg) {
    const div = document.createElement('div');
    div.className = 'system-msg';
    div.innerHTML = `<span class="system-msg__text">${escHtml(msg.text)}</span>`;
    return div;
  }

  function _createMessageRow(msg, groupClass, showSender, animate = true) {
    const isOut = msg.sender === _myName;
    const dir   = isOut ? 'out' : 'in';

    const row = document.createElement('div');
    row.className = `msg-row msg-row--${dir}${groupClass ? ' ' + groupClass : ''}${groupClass === '' || groupClass === 'group-top' ? ' group-start' : ''}${animate ? ' animate-in' : ''}`;
    row.setAttribute('data-sender', msg.sender);
    row.setAttribute('data-ts', msg.timestamp?.toISOString?.() || '');

    // Sender name (show for "in" messages if first in group and group chat)
    if (!isOut && showSender && msg.sender) {
      const senderEl = document.createElement('div');
      senderEl.className = 'msg-sender';
      senderEl.textContent = msg.sender;
      row.appendChild(senderEl);
    }

    // Bubble
    const bubble = document.createElement('div');
    const onlyEmoji = msg.text && isEmojiOnly(msg.text);
    bubble.className = `bubble bubble--${dir}${onlyEmoji ? ' emoji-only' : ''}`;

    let content = '';

    // Media
    if (msg.mediaType) {
      const url = _mediaUrl(msg.mediaFilename);
      content += url ? _renderRealMedia(msg, url) : _renderMediaPlaceholder(msg);
    }

    // Message text
    if (msg.text) {
      content += `<span class="bubble-text">${linkify(msg.text)}</span>`;
    }

    // Timestamp
    const timeStr = WhatsAppParser.formatTime(msg.timestamp);
    content += `<span class="bubble-meta"><span class="bubble-time">${escHtml(timeStr)}</span></span>`;

    bubble.innerHTML = content;
    row.appendChild(bubble);
    return row;
  }

  // ── Media Rendering ───────────────────────────────────────────────────────

  /** Render an actual media element (image/video/audio/doc) from a blob URL. */
  function _renderRealMedia(msg, url) {
    const safeUrl   = escHtml(url);
    const safeLabel = escHtml(msg.mediaFilename || msg.mediaLabel || 'Media');

    switch (msg.mediaType) {

      case 'image': {
        // HEIC/HEIF not natively supported in Chrome — fall through to placeholder
        const ext = (msg.mediaFilename || '').split('.').pop().toLowerCase();
        if (ext === 'heic' || ext === 'heif') return _renderMediaPlaceholder(msg);
        return `
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
             class="bubble-media-img-wrap" title="Open full size">
            <img src="${safeUrl}" alt="${safeLabel}" class="bubble-img" loading="lazy">
          </a>`;
      }

      case 'video':
        return `
          <video class="bubble-video" controls preload="metadata" playsinline>
            <source src="${safeUrl}">
          </video>`;

      case 'audio':
        return `
          <div class="bubble-audio-row">
            <span class="bubble-audio-icon" aria-hidden="true">🎤</span>
            <audio class="bubble-audio" controls preload="metadata">
              <source src="${safeUrl}">
            </audio>
          </div>`;

      case 'document':
        return `
          <a href="${safeUrl}" download="${safeLabel}"
             class="bubble-doc" title="Download ${safeLabel}">
            <span class="bubble-doc__icon">📄</span>
            <span class="bubble-doc__name">${safeLabel}</span>
            <span class="bubble-doc__dl">↓ Download</span>
          </a>`;

      default:
        return _renderMediaPlaceholder(msg);
    }
  }

  /** Fallback placeholder for omitted / unsupported media. */
  function _renderMediaPlaceholder(msg) {
    const icon = MEDIA_ICONS[msg.mediaType] || '📎';
    return `
      <div class="media-placeholder">
        <span class="media-placeholder__icon">${icon}</span>
        <span class="media-placeholder__label">${escHtml(msg.mediaLabel || 'Media')}</span>
      </div>`;
  }

  // ── Name Modal ────────────────────────────────────────────────────────────

  /**
   * Build the name-selection modal body HTML.
   * @param {Participant[]} participants
   * @param {string} defaultChatName
   * @returns {string} HTML string
   */
  function buildNameModalBody(participants, defaultChatName) {
    const radios = participants.map((p, i) => {
      const color    = avatarColor(p.name);
      const initials = avatarInitials(p.name);
      const checked  = i === 0 ? 'checked' : '';
      return `
        <label class="participant-option">
          <input type="radio" name="my-name" value="${escHtml(p.name)}" ${checked}>
          <div class="participant-option__avatar" style="background:${color}" aria-hidden="true">${escHtml(initials)}</div>
          <div class="participant-option__info">
            <div class="participant-option__name">${escHtml(p.name)}</div>
            <div class="participant-option__count">${p.count.toLocaleString()} messages</div>
          </div>
        </label>
      `;
    }).join('');

    return `
      <div class="name-setup">
        <div class="name-setup__participants">
          <p class="name-setup__section-label">Which one is you?</p>
          <div class="participant-radio-group" id="participant-radio-group">
            ${radios}
          </div>
        </div>
        <div class="name-setup__chat-name-wrap">
          <label class="form-label" for="modal-chat-name-input">Chat name</label>
          <input
            type="text"
            id="modal-chat-name-input"
            class="form-input"
            value="${escHtml(defaultChatName)}"
            placeholder="Enter a name for this chat"
            maxlength="80"
          >
        </div>
      </div>
    `;
  }

  // Public API
  return {
    renderChatList,
    setActiveChatItem,
    renderChatHeader,
    renderMessages,
    prependEarlierMessages,
    getRenderedFrom,
    setMediaData,
    buildNameModalBody,
    avatarColor,
    avatarInitials,
  };

})();
