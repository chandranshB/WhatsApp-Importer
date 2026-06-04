/**
 * renderer.js — DOM Renderer
 * Renders chat list sidebar items and message bubbles.
 * WhatsApp Export Viewer
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
    if (str == null) return '';
    return String(str)
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
    image:    '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    video:    '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
    audio:    '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    gif:      '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/></svg>',
    sticker:  '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm3.5 9.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5zM15.5 11c-.83 0-1.5-.67-1.5-1.5S14.67 8 15.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    document: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
    contact:  '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    media:    '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-3.31-2.69-6-6-6S3 1.69 3 5v13.5c0 3.87 3.13 7 7 7s7-3.13 7-7V6h-1.5z"/></svg>',
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

  let _missingMedia = [];

  /** Called by app.js once so renderer can look up blob URLs. */
  function setMediaData(map) { _mediaData = map; }

  /** Return the blob URL for a media file, or null if not available. */
  function _mediaUrl(filename) {
    if (!_mediaData || !_chatId || !filename) return null;
    const url = _mediaData.get(`${_chatId}|${filename}`);
    if (url) return url;
    
    // Missing from memory cache!
    _missingMedia.push(filename);
    return null;
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
    return _missingMedia;
  }

  /** Return the current rendered-from index (for scroll state saving). */
  function getRenderedFrom() { return _renderedFrom; }

  function prependEarlierMessages() {
    _missingMedia = [];
    const inner = document.getElementById('messages-inner');
    const newFrom = Math.max(0, _renderedFrom - CHUNK_SIZE);
    _renderChunk(newFrom, _renderedFrom, inner, true);
    _renderedFrom = newFrom;
    _updateLoadEarlierBtn();
    return _missingMedia;
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
      const isFirst = prevSender !== msg.sender || prevType === 'system';
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
    const tsDate = msg.timestamp ? new Date(msg.timestamp) : null;
    row.setAttribute('data-ts', (tsDate && !isNaN(tsDate)) ? tsDate.toISOString() : '');

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
    const isSticker = msg.mediaType === 'sticker';
    bubble.className = `bubble bubble--${dir}${onlyEmoji ? ' emoji-only' : ''}${isSticker ? ' bubble--sticker' : ''}`;

    let content = '';

    // Media
    if (msg.mediaType) {
      const url = _mediaUrl(msg.mediaFilename);
      content += url ? _renderRealMedia(msg, url) : _renderMediaPlaceholder(msg, true);
    }

    // Message text
    if (msg.text) {
      content += `<span class="bubble-text">${linkify(msg.text)}</span>`;
    }

    // Timestamp (inside for WhatsApp)
    const timeStr = WhatsAppParser.formatTime(msg.timestamp);
    content += `<span class="bubble-meta"><span class="bubble-time">${escHtml(timeStr)}</span></span>`;

    bubble.innerHTML = content;
    row.appendChild(bubble);

    // Timestamp (outside for iMessage)
    const timeOut = document.createElement('div');
    timeOut.className = 'msg-time-out';
    timeOut.textContent = timeStr;
    row.appendChild(timeOut);

    return row;
  }

  // ── Media Rendering ───────────────────────────────────────────────────────

  /** Render an actual media element (image/video/audio/doc) from a blob URL. */
  function _renderRealMedia(msg, url) {
    const safeUrl   = escHtml(url);
    const safeLabel = escHtml(msg.mediaFilename || msg.mediaLabel || 'Media');

    switch (msg.mediaType) {

      case 'image':
      case 'sticker': {
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
          <a href="${safeUrl}" class="bubble-media-video-wrap" title="Play Video" data-is-video="true">
            <video class="bubble-video-preview" preload="metadata" playsinline muted>
              <source src="${safeUrl}#t=0.001">
            </video>
            <div class="bubble-video-play-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </a>`;

      case 'audio':
        return `
          <div class="custom-audio">
            <button class="custom-audio__play-btn" aria-label="Play/Pause">
              <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <div class="custom-audio__progress-wrap">
              <input type="range" class="custom-audio__slider" value="0" min="0" max="100" step="0.1" style="--value: 0%">
              <div class="custom-audio__time">0:00</div>
            </div>
            <audio class="custom-audio__element" src="${safeUrl}" preload="metadata" hidden onloadedmetadata="
              const t = this.parentElement.querySelector('.custom-audio__time');
              if(t && this.duration && isFinite(this.duration)) {
                t.textContent = Math.floor(this.duration / 60) + ':' + Math.floor(this.duration % 60).toString().padStart(2, '0');
              }
            "></audio>
          </div>`;

      case 'document': {
        const ext = safeLabel.split('.').pop().toLowerCase();
        const isPdf = ext === 'pdf';
        
        let actionsHtml = '';
        if (isPdf) {
          actionsHtml += `
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="bubble-doc__action bubble-doc__action--view" title="View PDF">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              View
            </a>`;
        }
        actionsHtml += `
          <a href="${safeUrl}" download="${safeLabel}" class="bubble-doc__action bubble-doc__action--download" title="Download ${safeLabel}">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Download
          </a>`;

        return `
          <div class="bubble-doc">
            <div class="bubble-doc__info">
              <div class="bubble-doc__icon">
                ${MEDIA_ICONS.document}
              </div>
              <span class="bubble-doc__name" title="${safeLabel}">${safeLabel}</span>
            </div>
            <div class="bubble-doc__actions">
              ${actionsHtml}
            </div>
          </div>`;
      }

      default:
        return _renderMediaPlaceholder(msg);
    }
  }

  /** Fallback placeholder for omitted / unsupported / loading media. */
  function _renderMediaPlaceholder(msg, isMissing = false) {
    const icon = MEDIA_ICONS[msg.mediaType] || '📎';
    
    // Add attributes so we can upgrade it later when the Blob loads from IndexedDB
    const attrs = isMissing ? `data-media-filename="${escHtml(msg.mediaFilename)}" data-media-type="${escHtml(msg.mediaType)}" data-media-label="${escHtml(msg.mediaLabel || '')}"` : '';
    
    return `
      <div class="media-placeholder" ${attrs}>
        <span class="media-placeholder__icon">${isMissing ? '🔄' : icon}</span>
        <span class="media-placeholder__label">${escHtml(msg.mediaLabel || 'Media')}</span>
      </div>`;
  }

  /** Upgrades a placeholder element to the real media element. */
  function upgradeMediaElement(el, url) {
    const msg = {
      mediaFilename: el.getAttribute('data-media-filename'),
      mediaType: el.getAttribute('data-media-type'),
      mediaLabel: el.getAttribute('data-media-label'),
    };
    el.outerHTML = _renderRealMedia(msg, url);
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
    upgradeMediaElement,
    buildNameModalBody,
    avatarColor,
    avatarInitials,
  };

})();
