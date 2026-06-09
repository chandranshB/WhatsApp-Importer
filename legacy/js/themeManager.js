/**
 * themeManager.js — Theme Switcher
 * Manages CSS [data-theme] attribute and persists choice.
 * WhatsApp Export Viewer
 */

'use strict';

const ThemeManager = (() => {

  const THEMES = ['whatsapp', 'imessage'];
  let _current = 'whatsapp';
  let _mode = null;

  /**
   * Initialize with saved theme or default.
   */
  function init() {
    const saved = Storage.loadTheme();
    _mode = Storage.loadMode();
    applyTheme(saved, false);
    _updatePicker();
  }

  function getEffectiveMode() {
    if (_mode) return _mode;
    return _current === 'whatsapp' ? 'dark' : 'light';
  }

  function toggleMode() {
    _mode = getEffectiveMode() === 'light' ? 'dark' : 'light';
    Storage.saveMode(_mode);
    applyTheme(_current, true);
  }

  /**
   * Apply a theme by name.
   * @param {string} name
   * @param {boolean} animate - whether to transition (default true)
   */
  function applyTheme(name, animate = true) {
    if (!THEMES.includes(name)) name = THEMES[0];
    _current = name;

    if (!animate) {
      // Suppress transitions during initial load
      document.documentElement.classList.add('no-transition');
    }

    document.documentElement.setAttribute('data-theme', name);
    document.documentElement.setAttribute('data-mode', getEffectiveMode());
    Storage.saveTheme(name);
    _updatePicker();

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      if (name === 'whatsapp') {
        metaTheme.content = getEffectiveMode() === 'light' ? '#F0F2F5' : '#202C33';
      } else {
        metaTheme.content = getEffectiveMode() === 'dark' ? '#000000' : '#F5F5F7';
      }
    }

    if (!animate) {
      // Re-enable transitions after a frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-transition');
        });
      });
    }
  }

  /**
   * Toggle to the next theme in sequence.
   */
  function cycleTheme() {
    const idx  = THEMES.indexOf(_current);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next);
    return next;
  }

  /**
   * Get current theme name.
   */
  function current() { return _current; }

  /**
   * Update the theme picker UI.
   */
  function _updatePicker() {
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeOption === _current);
    });
  }

  /**
   * Toggle the theme picker panel visibility.
   */
  function togglePicker() {
    const picker = document.getElementById('theme-picker');
    picker.hidden = !picker.hidden;
  }

  /**
   * Close the theme picker panel.
   */
  function closePicker() {
    const picker = document.getElementById('theme-picker');
    picker.hidden = true;
  }

  return { init, applyTheme, cycleTheme, current, toggleMode, togglePicker, closePicker };

})();
