/**
 * app.js — Main Application Orchestrator
 * Wires together parser, storage, renderer, themeManager, scrollManager.
 * ChatView – WhatsApp Chat Reader
 */

'use strict';

const App = (() => {

  // ── State ─────────────────────────────────────────────────────────────────
  let _chats          = [];        // Chat metadata list
  let _activeId       = null;      // Currently displayed chat ID
  let _pendingParse   = null;      // Parsed result waiting for name modal
  let _isMobile       = false;
  let _isLoadingEarlier = false;
  let _sentinelObserver = null;

  /**
   * Session-scoped media store.
   * Keys:   "chatId|filename"  (e.g. "abc123|IMG-20260101-WA0001.jpg")
   * Values: Blob URL string   (created via URL.createObjectURL)
   * Blob URLs are automatically revoked by the browser when the page closes.
   * Manually revoked when a chat is deleted (see _revokeMediaForChat).
   */
  const _mediaStore = new Map();

  // ── DOM References ────────────────────────────────────────────────────────
  let $fileInput, $messagesContainer, $sidebar, $chatView, $emptyState, $chatPanel;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    _isMobile = window.innerWidth <= 768;

    // Cache DOM
    $fileInput          = document.getElementById('file-input');
    $messagesContainer  = document.getElementById('messages-container');
    $sidebar            = document.getElementById('sidebar');
    $chatView           = document.getElementById('chat-view');
    $emptyState         = document.getElementById('empty-state');
    $chatPanel          = document.getElementById('chat-panel');

    // Init theme (no-transition on first load)
    ThemeManager.init();

    // Init scroll manager
    ScrollManager.attach($messagesContainer);

    // Share the media store with the renderer so it can look up blob URLs
    Renderer.setMediaData(_mediaStore);

    // Load persisted chats
    _chats = Storage.listChats();
    _refreshSidebar();

    // Restore active chat
    const savedActive = Storage.loadActive();
    if (savedActive && _chats.find(c => c.id === savedActive)) {
      openChat(savedActive, false);
    } else {
      _showEmptyState();
    }

    // Wire up events
    _bindEvents();

    // Handle mobile resize
    window.addEventListener('resize', _onResize, { passive: true });
  }

  // ── Event Binding ─────────────────────────────────────────────────────────

  function _bindEvents() {
    // Import buttons
    document.getElementById('import-btn').addEventListener('click', () => _triggerFileInput());
    document.getElementById('sidebar-import-btn').addEventListener('click', () => _triggerFileInput());
    document.getElementById('empty-import-btn').addEventListener('click', () => _triggerFileInput());

    // File input
    $fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) _handleFileSelect(file);
    });

    // Drag & drop
    document.addEventListener('dragenter', _onDragEnter, false);
    document.addEventListener('dragleave', _onDragLeave, false);
    document.addEventListener('dragover',  e => e.preventDefault(), false);
    document.addEventListener('drop',      _onDrop, false);

    // Mobile sidebar overlay
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', _hideSidebar);
    }

    // Back button (mobile)
    document.getElementById('back-btn').addEventListener('click', () => {
      _showSidebar();
      _showEmptyState();
    });

    // Theme & Mode buttons
    document.getElementById('theme-btn').addEventListener('click', () => ThemeManager.togglePicker());
    document.getElementById('mode-btn').addEventListener('click', () => ThemeManager.toggleMode());

    // Theme picker options
    document.getElementById('theme-picker').addEventListener('click', e => {
      const btn = e.target.closest('.theme-option[data-theme-option]');
      if (btn) {
        ThemeManager.applyTheme(btn.dataset.themeOption);
        setTimeout(() => ThemeManager.closePicker(), 300);
      }
    });

    // Delete chat button (in chat header)
    document.getElementById('chat-delete-btn').addEventListener('click', () => {
      if (_activeId) _promptDeleteChat(_activeId);
    });

    // Name modal
    document.getElementById('name-modal-confirm').addEventListener('click', _onNameModalConfirm);
    document.getElementById('name-modal-cancel').addEventListener('click', _closeNameModal);
    document.getElementById('name-modal-backdrop').addEventListener('click', _closeNameModal);

    // Delete modal
    document.getElementById('delete-modal-confirm').addEventListener('click', _onDeleteModalConfirm);
    document.getElementById('delete-modal-cancel').addEventListener('click', _closeDeleteModal);
    document.getElementById('delete-modal-backdrop').addEventListener('click', _closeDeleteModal);

    // Search
    document.getElementById('search-input').addEventListener('input', e => _filterChatList(e.target.value));

    // Load-earlier button (manual fallback)
    document.getElementById('load-earlier-btn').addEventListener('click', () => _loadEarlier());

    // Storage toast close
    document.getElementById('storage-toast-close').addEventListener('click', () => {
      document.getElementById('storage-toast').hidden = true;
    });

    // Lightbox
    $messagesContainer.addEventListener('click', e => {
      const mediaWrap = e.target.closest('.bubble-media-img-wrap, .bubble-media-video-wrap');
      if (mediaWrap) {
        e.preventDefault();
        const isVideo = mediaWrap.dataset.isVideo === 'true';
        _openLightbox(mediaWrap.href, isVideo);
      }
    });
    document.getElementById('lightbox-close').addEventListener('click', _closeLightbox);
    document.getElementById('lightbox-backdrop').addEventListener('click', _closeLightbox);

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        ThemeManager.closePicker();
        _closeNameModal();
        _closeDeleteModal();
        _closeLightbox();
      }
    });

    // Close theme picker when clicking outside
    document.addEventListener('click', e => {
      const picker = document.getElementById('theme-picker');
      const btn    = document.getElementById('theme-btn');
      if (!picker.hidden && !picker.contains(e.target) && !btn.contains(e.target)) {
        ThemeManager.closePicker();
      }
    });

    _initLightboxVideo();

    // History API for Android back button to close lightbox
    window.addEventListener('popstate', e => {
      const lightbox = document.getElementById('lightbox');
      if (!lightbox.hidden) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(()=>{});
        }
        _closeLightbox(true); // true = don't double back
      }
    });
  }

  // ── File Handling ─────────────────────────────────────────────────────────

  function _triggerFileInput() {
    $fileInput.value = '';
    $fileInput.click();
  }

  /**
   * Handles both .txt and .zip files.
   */
  function _handleFileSelect(file) {
    if (!file) return;
    const name = file.name.toLowerCase();

    if (name.endsWith('.zip')) {
      _handleZipFile(file);
    } else if (name.endsWith('.txt')) {
      _readTxtFile(file);
    } else {
      _showError('Please select a WhatsApp export .txt or .zip file.');
    }
  }

  /**
   * Extract the chat .txt AND all media files from a WhatsApp ZIP export.
   * Media files are stored as Blob URLs in _mediaStore keyed by chatId|filename.
   * A chatId is pre-generated here so media can be associated before the name modal.
   */
  async function _handleZipFile(file) {
    if (typeof JSZip === 'undefined') {
      _showError('ZIP support unavailable — please import the .txt file directly.');
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);

      // ── Find the chat .txt ─────────────────────────────────────────────────
      let txtEntry = null;
      let txtName  = '';
      zip.forEach((relativePath, entry) => {
        if (entry.dir) return;
        const lower = relativePath.toLowerCase();
        if (lower.endsWith('.txt') && (!txtEntry || lower.includes('chat'))) {
          txtEntry = entry;
          txtName  = relativePath;
        }
      });

      if (!txtEntry) {
        _showError('No chat .txt found inside this ZIP. Is this a WhatsApp export?');
        return;
      }

      // ── Pre-generate the chat ID so media can be keyed now ───────────────────
      const pendingChatId = Storage.generateId();

      // ── Extract media files concurrently ──────────────────────────────────
      const mediaJobs = [];
      zip.forEach((relativePath, entry) => {
        if (entry.dir || relativePath.toLowerCase().endsWith('.txt')) return;
        const filename = relativePath.split('/').pop();
        const ext      = filename.split('.').pop().toLowerCase();
        const mime     = _getMimeType(ext);
        if (!mime) return; // Skip unknown types
        mediaJobs.push(
          entry.async('arraybuffer').then(async buf => {
            const blob = new Blob([buf], { type: mime });
            const url  = URL.createObjectURL(blob);
            _mediaStore.set(`${pendingChatId}|${filename}`, url);
            if (typeof MediaStorage !== 'undefined') {
              await MediaStorage.saveMedia(pendingChatId, filename, blob);
            }
          })
        );
      });
      await Promise.all(mediaJobs);

      // ── Parse the chat text ────────────────────────────────────────────────
      const text     = await txtEntry.async('string');
      const hintName = file.name.replace(/\.zip$/i, '.txt') || txtName;
      _processText(text, hintName, pendingChatId);

    } catch (err) {
      console.error('ZIP error:', err);
      _showError('Could not read the ZIP file. Make sure it is a WhatsApp export.');
    }
  }

  /**
   * Map file extension to MIME type for Blob creation.
   * Correct MIME type ensures browsers can play/display the media correctly.
   */
  function _getMimeType(ext) {
    const map = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif',  webp: 'image/webp', bmp: 'image/bmp',
      heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
      mp4: 'video/mp4',   mov: 'video/quicktime', avi: 'video/x-msvideo',
      '3gp': 'video/3gpp', mkv: 'video/x-matroska', webm: 'video/webm',
      opus: 'audio/ogg',  ogg: 'audio/ogg',  mp3: 'audio/mpeg',
      m4a:  'audio/mp4',  aac: 'audio/aac',  wav: 'audio/wav', amr: 'audio/amr',
      pdf:  'application/pdf',
      doc:  'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls:  'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return map[ext.toLowerCase()] || null;
  }

  function _readTxtFile(file) {
    const reader = new FileReader();
    reader.onload = e => _processText(e.target.result, file.name);
    reader.onerror = () => _showError('Could not read the file. Please try again.');
    reader.readAsText(file, 'utf-8');
  }

  function _processText(text, filename, chatId = null) {
    try {
      const result = WhatsAppParser.parse(text);

      if (!result.messages.length) {
        _showError('No messages found. Make sure this is a WhatsApp export .txt file.');
        return;
      }

      if (!result.participants.length) {
        _showError('Could not identify any chat participants in this file.');
        return;
      }

      _pendingParse = {
        ...result,
        filename,
        chatId, // pre-assigned ID (from ZIP import) or null (will be generated later)
      };

      _openNameModal(result.participants, filename);
    } catch (err) {
      console.error('Parse error:', err);
      _showError('Failed to parse the chat file. Make sure it\'s a valid WhatsApp export.');
    }
  }

  // ── Name Modal ────────────────────────────────────────────────────────────

  function _openNameModal(participants, filename) {
    // Generate a default chat name
    const defaultName = _inferChatName(participants, filename);

    const body = document.getElementById('name-modal-body');
    body.innerHTML = Renderer.buildNameModalBody(participants, defaultName);

    const modal = document.getElementById('name-modal');
    modal.hidden = false;

    // Focus first radio
    const firstRadio = modal.querySelector('input[type="radio"]');
    if (firstRadio) firstRadio.focus();
  }

  function _closeNameModal() {
    document.getElementById('name-modal').hidden = true;
    _pendingParse = null;
  }

  function _onNameModalConfirm() {
    const modal = document.getElementById('name-modal');

    const selected = modal.querySelector('input[name="my-name"]:checked');
    if (!selected) {
      // Shake the radio group
      const group = modal.querySelector('.participant-radio-group');
      group.style.animation = 'shake 0.4s ease';
      group.addEventListener('animationend', () => group.style.animation = '', { once: true });
      return;
    }

    const myName   = selected.value;
    const chatName = (modal.querySelector('#modal-chat-name-input')?.value || '').trim() || myName;

    modal.hidden = true;
    _saveAndOpenPendingChat(myName, chatName);
    _pendingParse = null;
  }

  // ── Chat Creation ─────────────────────────────────────────────────────────

  function _saveAndOpenPendingChat(myName, chatName) {
    if (!_pendingParse) return;

    const { messages, participants } = _pendingParse;
    // Use the pre-generated chatId from ZIP import, or generate a new one for .txt imports
    const id = _pendingParse.chatId || Storage.generateId();

    // Build date metadata
    const validDates = messages
      .map(m => m.timestamp)
      .filter(d => d instanceof Date && !isNaN(d));

    const firstDate = validDates[0]?.toISOString() || null;
    const lastDate  = validDates[validDates.length - 1]?.toISOString() || null;

    // Build preview snippet
    const lastMsg = [...messages].reverse().find(m => m.type === 'message' && m.text);
    const preview = lastMsg
      ? `${lastMsg.sender === myName ? 'You' : lastMsg.sender}: ${lastMsg.text.slice(0, 50)}`
      : null;

    const chat = {
      id,
      name:         chatName,
      myName,
      participants: participants.map(p => p.name),
      messageCount: messages.length,
      firstDate,
      lastDate,
      preview,
      importedAt:   new Date().toISOString(),
      messages,
    };

    const result = Storage.saveChat(chat);

    if (!result.ok && result.quota) {
      // Show storage warning toast
      const toast = document.getElementById('storage-toast');
      const toastText = document.getElementById('storage-toast-text');
      toastText.textContent = 'Storage full — chat is viewable this session but won\'t persist after refresh.';
      toast.hidden = false;
    }

    // Add to local state (without messages for list)
    const { messages: _ignored, ...meta } = chat;
    _chats.unshift(meta);
    _refreshSidebar();

    // Open the chat (using in-memory messages since storage might have failed)
    _openChatWithMessages(id, meta, messages, true);
  }

  // ── Chat Opening ──────────────────────────────────────────────────────────

  /**
   * Open a chat by ID from storage.
   * @param {string} id
   * @param {boolean} isNew - true if newly imported (scroll to bottom)
   */
  function openChat(id, isNew = false) {
    const loaded = Storage.loadChat(id);
    if (!loaded) {
      console.warn('Chat not found:', id);
      return;
    }

    _openChatWithMessages(id, loaded.meta, loaded.messages, isNew);
  }

  function _openChatWithMessages(id, meta, messages, isNew) {
    // Stop saving scroll for the previous chat
    ScrollManager.deactivate();

    // Kill the sentinel observer immediately — must not fire during transition
    if (_sentinelObserver) {
      _sentinelObserver.disconnect();
      _sentinelObserver = null;
    }

    // Update app state synchronously
    _activeId = id;
    Storage.saveActive(id);
    Renderer.setActiveChatItem(id);
    Renderer.renderChatHeader(meta);

    // Load saved scroll state
    const savedState   = isNew ? null : Storage.loadScroll(id);
    const startFrom    = savedState?.fromIndex ?? null;
    const targetScroll = savedState?.scrollTop  ?? null;

    // Reset the container so no old-chat content is visible during render
    $messagesContainer.scrollTop = 0;

    // Render the correct chunk for this chat
    const missingMedia = Renderer.renderMessages(messages, meta.myName, startFrom, id);
    _hydrateMedia(missingMedia);

    // ── Restore scroll synchronously ───────────────────────────────────────
    // Setting .scrollTop after Renderer.renderMessages forces a synchronous layout
    // (browser computes the new scrollHeight) and applies the position BEFORE any
    // paint, so the user never sees the wrong scroll position.
    if (targetScroll !== null) {
      $messagesContainer.scrollTop = targetScroll;
    } else {
      // First open or no saved state — jump to the latest messages
      ScrollManager.scrollToBottom(false);
    }

    _showChatView();
    if (_isMobile) _hideSidebar();

    // Begin tracking scroll for THIS chat
    ScrollManager.startTracking(id);

    // Connect the sentinel observer after the initial paint.
    // The single RAF ensures the browser has painted the correct scroll position
    // before the observer starts watching, preventing a spurious load-earlier call.
    // The stale guard (id === _activeId) ensures a fast chat-switch discards
    // this callback if a newer chat has already been opened.
    requestAnimationFrame(() => {
      if (_activeId !== id) return; // Stale — another chat was opened first
      _setupSentinelObserver();
    });
  }

  // ── Sidebar & Panel Visibility ────────────────────────────────────────────

  function _showChatView() {
    $chatView.removeAttribute('hidden');
    $emptyState.setAttribute('hidden', '');
  }

  function _hideChatView() {
    $chatView.setAttribute('hidden', '');
    $emptyState.removeAttribute('hidden');
  }

  function _showEmptyState() {
    $emptyState.removeAttribute('hidden');
    $chatView.setAttribute('hidden', '');
    _activeId = null;
    Storage.clearActive();
    Renderer.setActiveChatItem(null);
  }

  function _showSidebar() {
    $sidebar.classList.add('mobile-open');
    $sidebar.classList.remove('collapsed');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (overlay) overlay.classList.add('active');
  }

  function _hideSidebar() {
    $sidebar.classList.remove('mobile-open');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ── Chat Deletion ─────────────────────────────────────────────────────────

  let _chatToDelete = null;

  function _promptDeleteChat(id) {
    const chat = _chats.find(c => c.id === id);
    if (!chat) return;

    _chatToDelete = id;
    document.getElementById('delete-modal-body').textContent =
      `"${chat.name}" will be removed from storage.`;
    document.getElementById('delete-modal').hidden = false;
  }

  function _closeDeleteModal() {
    document.getElementById('delete-modal').hidden = true;
    _chatToDelete = null;
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────

  let _lbVideoRaf = null;

  function _initLightboxVideo() {
    const video = document.getElementById('lightbox-video');
    const wrap = document.getElementById('lightbox-video-wrap');
    const playBtn = document.getElementById('lb-play-btn');
    const fsBtn = document.getElementById('lb-fullscreen-btn');
    const slider = document.getElementById('lb-progress');
    const tCur = document.getElementById('lb-time-current');
    const tTot = document.getElementById('lb-time-total');
    
    // Play/Pause
    playBtn.addEventListener('click', e => {
      e.stopPropagation(); // prevent toggling UI overlay
      if (video.paused) video.play();
      else video.pause();
    });
    
    // Fullscreen
    fsBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        wrap.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen().catch(()=>{});
      }
    });
    
    // Fullscreen icon toggle
    document.addEventListener('fullscreenchange', () => {
      const isFs = !!document.fullscreenElement;
      if (isFs) fsBtn.classList.add('fullscreen');
      else fsBtn.classList.remove('fullscreen');
    });

    // Update play/pause icons
    video.addEventListener('play', () => {
      playBtn.classList.add('playing');
      _lbLoop();
    });
    video.addEventListener('pause', () => {
      playBtn.classList.remove('playing');
      cancelAnimationFrame(_lbVideoRaf);
    });
    
    // Format time helpers
    const fmt = t => {
      if (!isFinite(t) || isNaN(t)) return '0:00';
      return Math.floor(t / 60) + ':' + Math.floor(t % 60).toString().padStart(2, '0');
    };

    video.addEventListener('loadedmetadata', () => {
      tTot.textContent = fmt(video.duration);
      slider.max = video.duration || 100;
    });

    // Scrubber
    let isDragging = false;
    slider.addEventListener('input', () => {
      isDragging = true;
      tCur.textContent = fmt(slider.value);
      slider.style.setProperty('--value', (slider.value / slider.max * 100) + '%');
    });
    slider.addEventListener('change', () => {
      video.currentTime = slider.value;
      isDragging = false;
    });

    // High performance UI loop
    function _lbLoop() {
      if (!isDragging && video.duration) {
        slider.value = video.currentTime;
        tCur.textContent = fmt(video.currentTime);
        slider.style.setProperty('--value', (video.currentTime / video.duration * 100) + '%');
      }
      _lbVideoRaf = requestAnimationFrame(_lbLoop);
    }

    // Tap video to toggle controls visibility
    video.addEventListener('click', () => {
      wrap.classList.toggle('idle');
    });
  }

  function _openLightbox(url, isVideo = false) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const videoWrap = document.getElementById('lightbox-video-wrap');
    const video = document.getElementById('lightbox-video');
    const closeBtn = document.getElementById('lightbox-close');
    
    if (isVideo) {
      img.hidden = true;
      videoWrap.hidden = false;
      videoWrap.classList.remove('idle');
      video.src = url;
      video.play().catch(e => console.error('Video autoplay failed', e));
    } else {
      videoWrap.hidden = true;
      img.hidden = false;
      img.src = url;
    }
    
    lightbox.hidden = false;
    history.pushState({ lightbox: true }, ''); // Trap back button
    
    // Accessibility: focus the close button so keyboard users can close easily
    closeBtn.focus();
  }

  function _closeLightbox(fromPopState = false) {
    const lightbox = document.getElementById('lightbox');
    const video = document.getElementById('lightbox-video');
    const videoWrap = document.getElementById('lightbox-video-wrap');
    
    lightbox.hidden = true;
    
    if (!fromPopState && history.state && history.state.lightbox) {
      history.back(); // Clean up the pushState if user clicked 'X'
    }
    
    // Stop video playback and clear sources to save memory
    if (video) {
      video.pause();
      video.src = '';
      videoWrap.classList.remove('idle');
    }
    document.getElementById('lightbox-img').src = '';
  }

  function _onDeleteModalConfirm() {
    if (!_chatToDelete) return;
    const id = _chatToDelete;
    _closeDeleteModal();

    // Revoke blob URLs for this chat to free memory
    _revokeMediaForChat(id);

    // Delete from IDB if it exists
    if (typeof MediaStorage !== 'undefined') {
      MediaStorage.deleteChatMedia(id);
    }

    Storage.deleteChat(id);
    _chats = _chats.filter(c => c.id !== id);
    _refreshSidebar();

    if (_activeId === id) {
      _showEmptyState();
    }
  }

  /** Free all Blob URLs associated with a chat when it is deleted. */
  function _revokeMediaForChat(chatId) {
    const prefix = `${chatId}|`;
    for (const [key, url] of _mediaStore) {
      if (key.startsWith(prefix)) {
        URL.revokeObjectURL(url);
        _mediaStore.delete(key);
      }
    }
  }

  // ── Load Earlier (IntersectionObserver + manual button) ───────────────────

  function _setupSentinelObserver() {
    // Disconnect previous observer if any
    if (_sentinelObserver) {
      _sentinelObserver.disconnect();
      _sentinelObserver = null;
    }

    const sentinel = document.getElementById('load-sentinel');
    if (!sentinel) return;

    _sentinelObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) _loadEarlier();
      },
      {
        root: $messagesContainer,
        // Trigger 120px before the sentinel actually enters the viewport
        // so loading feels seamless
        rootMargin: '120px 0px 0px 0px',
        threshold: 0,
      }
    );

    _sentinelObserver.observe(sentinel);
  }

  /**
   * Load an earlier chunk of messages WITHOUT moving the user's viewport.
   *
   * WHY SYNCHRONOUS (no RAF):
   * JavaScript is single-threaded. The browser cannot paint between our
   * DOM mutation and our scrollTop correction as long as both happen in
   * the same synchronous task. Using requestAnimationFrame would introduce
   * a gap where the browser paints with the wrong scrollTop — causing the
   * visible "jump". Doing it synchronously eliminates that gap entirely.
   *
   * WHY overflow-anchor:none on the container:
   * Without it, the browser's scroll-anchoring also tries to correct the
   * scroll position when content is prepended. This double-correction
   * causes the jump. With overflow-anchor:none WE are the sole owner of
   * scrollTop during a prepend.
   *
   * Reading container.scrollHeight after a DOM mutation forces a synchronous
   * reflow, so we always get the correct post-mutation height.
   */
  function _loadEarlier() {
    if (_isLoadingEarlier) return;
    if (Renderer.getRenderedFrom() <= 0) {
      // Nothing more to load — hide the button
      const wrap = document.getElementById('load-earlier-wrap');
      if (wrap) wrap.hidden = true;
      return;
    }

    _isLoadingEarlier = true;

    const container = $messagesContainer;

    // ── Step 1: snapshot state BEFORE any DOM changes ──────────────────────
    const prevScrollTop    = container.scrollTop;
    const prevScrollHeight = container.scrollHeight;

    // ── Step 2: mutate the DOM (synchronous) ───────────────────────────────
    const missingMedia = Renderer.prependEarlierMessages();
    _hydrateMedia(missingMedia);

    // ── Step 3: correct scrollTop synchronously, in the same JS task ───────
    // Reading .scrollHeight here forces a synchronous layout so we get the
    // real post-mutation height. Setting .scrollTop in the same task means
    // the browser will paint ONCE with the correct position — no flash.
    const newScrollHeight = container.scrollHeight;
    const delta           = newScrollHeight - prevScrollHeight;
    container.scrollTop   = prevScrollTop + delta;

    // ── Step 4: release the guard ──────────────────────────────────────────
    _isLoadingEarlier = false;
  }

  // ── Sidebar Refresh ───────────────────────────────────────────────────────

  function _refreshSidebar() {
    Renderer.renderChatList(
      _chats,
      _activeId,
      (id) => openChat(id, false),
      (id) => _promptDeleteChat(id)
    );
  }

  // ── Search / Filter ───────────────────────────────────────────────────────

  function _filterChatList(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('.chat-item');

    items.forEach(item => {
      const name = item.querySelector('.chat-item__name')?.textContent?.toLowerCase() || '';
      item.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  let _dragCount = 0;

  function _onDragEnter(e) {
    if (!_hasTxtFile(e.dataTransfer)) return;
    _dragCount++;
    document.getElementById('drop-overlay').classList.add('active');
  }

  function _onDragLeave() {
    _dragCount--;
    if (_dragCount <= 0) {
      _dragCount = 0;
      document.getElementById('drop-overlay').classList.remove('active');
    }
  }

  function _onDrop(e) {
    e.preventDefault();
    _dragCount = 0;
    document.getElementById('drop-overlay').classList.remove('active');

    const file = e.dataTransfer?.files?.[0];
    if (file) _handleFileSelect(file);
  }

  function _hasTxtFile(dt) {
    if (!dt) return false;
    for (const item of dt.items || []) {
      if (item.kind === 'file') return true;
    }
    return false;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function _inferChatName(participants, filename) {
    // Try to extract name from WhatsApp filename format: "WhatsApp Chat with Alice.txt"
    const fromFilename = filename
      .replace(/WhatsApp Chat with\s+/i, '')
      .replace(/\.txt$/i, '')
      .trim();

    if (fromFilename && fromFilename !== filename.replace(/\.txt$/i, '').trim()) {
      return fromFilename;
    }

    if (participants.length === 2) {
      // 1-on-1: use the second participant (first is assumed "you" — most frequent)
      return participants[1]?.name || participants[0]?.name || 'Chat';
    }
    if (participants.length > 2) {
      // Group: all names except the first (assumed "you") up to 3, use first names
      const others = participants.slice(1, 4).map(p => p.name.split(' ')[0]);
      return others.join(', ');
    }
    return fromFilename || 'Chat';
  }

  function _showError(msg) {
    // Simple shake toast — use storage toast for errors too
    const toast    = document.getElementById('storage-toast');
    const toastTxt = document.getElementById('storage-toast-text');
    toastTxt.textContent = '⚠️ ' + msg;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 5000);
  }

  // ── Missing Media Hydration ───────────────────────────────────────────────

  function _hydrateMedia(missingMedia) {
    if (!missingMedia || missingMedia.length === 0 || typeof MediaStorage === 'undefined') return;
    
    // Deduplicate
    const unique = [...new Set(missingMedia)];
    
    unique.forEach(async filename => {
      const blob = await MediaStorage.loadMedia(_activeId, filename);
      if (blob) {
        const url = URL.createObjectURL(blob);
        _mediaStore.set(`${_activeId}|${filename}`, url);
        
        // Find all placeholders for this filename and upgrade them!
        const els = document.querySelectorAll(`[data-media-filename="${CSS.escape(filename)}"]`);
        els.forEach(el => {
          Renderer.upgradeMediaElement(el, url);
        });
      }
    });
  }

  function _onResize() {
    const wasMobile = _isMobile;
    _isMobile = window.innerWidth <= 768;
    if (wasMobile !== _isMobile) {
      // Reset sidebar state on breakpoint change
      $sidebar.classList.remove('mobile-open', 'collapsed');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      if (overlay) overlay.classList.remove('active');
    }
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return { openChat };

})();
