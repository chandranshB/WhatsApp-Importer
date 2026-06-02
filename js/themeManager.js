/**
 * themeManager.js — Theme Switcher
 * Manages CSS [data-theme] attribute and persists choice.
 * ChatView – WhatsApp Chat Reader
 */

'use strict';

const ThemeManager = (() => {

  const THEMES = ['whatsapp', 'imessage'];
  let _current = 'whatsapp';

  /**
   * Initialize with saved theme or default.
   */
  function init() {
    const saved = Storage.loadTheme();
    applyTheme(saved, false);
    _updatePicker();
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
    Storage.saveTheme(name);
    _updatePicker();

    // Update meta theme-color for mobile browsers
    const themeColors = { whatsapp: '#202C33', imessage: '#F5F5F7' };
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = themeColors[name] || '#111B21';

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
      btn.classList.toggle('active', btn.dataset.theme === _current);
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

  return { init, applyTheme, cycleTheme, current, togglePicker, closePicker };

})();
