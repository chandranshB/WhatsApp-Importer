/**
 * scrollManager.js — Per-chat Scroll Position Saver/Restorer
 * Saves { fromIndex, scrollTop } so the exact rendered chunk + position is restored.
 * WhatsApp Export Viewer
 */

'use strict';

const ScrollManager = (() => {

  let _activeId  = null;
  let _container = null;
  let _saveTimer = null;
  const DEBOUNCE_MS = 400;

  /**
   * Attach the scroll manager to the messages container.
   * Call once on app init.
   */
  function attach(container) {
    _container = container;
    container.addEventListener('scroll', _onScroll, { passive: true });
  }

  /**
   * Begin tracking scroll position for a specific chat.
   * Call AFTER rendering messages and AFTER setting scrollTop.
   * @param {string} chatId
   */
  function startTracking(chatId) {
    _activeId = chatId;
  }

  /**
   * Stop tracking — flushes the current position immediately.
   */
  function deactivate() {
    if (_activeId && _container) {
      _saveNow();
    }
    clearTimeout(_saveTimer);
    _activeId = null;
  }

  /**
   * Scroll to the bottom of the messages container.
   * @param {boolean} smooth
   */
  function scrollToBottom(smooth = true) {
    if (!_container) return;
    _container.scrollTo({
      top: _container.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }

  /**
   * Returns true if the container is scrolled near the bottom.
   */
  function isNearBottom(threshold = 100) {
    if (!_container) return true;
    const { scrollTop, scrollHeight, clientHeight } = _container;
    return scrollHeight - scrollTop - clientHeight <= threshold;
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  function _onScroll() {
    if (!_activeId) return;
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(_saveNow, DEBOUNCE_MS);
  }

  function _saveNow() {
    if (!_activeId || !_container) return;
    Storage.saveScroll(_activeId, {
      fromIndex: Renderer.getRenderedFrom(),
      scrollTop: _container.scrollTop,
    });
  }

  return { attach, startTracking, deactivate, scrollToBottom, isNearBottom };

})();
