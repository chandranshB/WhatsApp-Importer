/**
 * audioManager.js — Custom Audio Player Controller
 * Handles play/pause and progress bar dragging via event delegation.
 */

'use strict';

const AudioManager = (() => {

  let _currentAudio = null;
  let _currentPlayBtn = null;

  function init() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    container.addEventListener('click', _handleClick);
    container.addEventListener('input', _handleInput);
  }

  function _formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function _handleClick(e) {
    const playBtn = e.target.closest('.custom-audio__play-btn');
    if (!playBtn) return;

    const container = playBtn.closest('.custom-audio');
    const audioEl = container.querySelector('.custom-audio__element');
    const slider = container.querySelector('.custom-audio__slider');
    const timeDisplay = container.querySelector('.custom-audio__time');

    if (!audioEl) return;

    // Pause currently playing if it's different
    if (_currentAudio && _currentAudio !== audioEl) {
      _currentAudio.pause();
      if (_currentPlayBtn) _currentPlayBtn.classList.remove('playing');
    }

    if (audioEl.paused) {
      if (!audioEl.dataset.initialized) {
        audioEl.addEventListener('timeupdate', () => {
          if (slider.dataset.isDragging !== 'true') {
            const percent = (audioEl.currentTime / (audioEl.duration || 1)) * 100;
            slider.value = percent || 0;
            slider.style.setProperty('--value', (percent || 0) + '%');
            timeDisplay.textContent = _formatTime(audioEl.currentTime);
          }
        });
        audioEl.addEventListener('ended', () => {
          playBtn.classList.remove('playing');
          slider.value = 0;
          slider.style.setProperty('--value', '0%');
          timeDisplay.textContent = _formatTime(audioEl.duration);
        });
        audioEl.dataset.initialized = 'true';
      }

      audioEl.play().catch(e => console.error("Audio playback error:", e));
      playBtn.classList.add('playing');
      
      _currentAudio = audioEl;
      _currentPlayBtn = playBtn;
    } else {
      audioEl.pause();
      playBtn.classList.remove('playing');
    }
  }

  function _handleInput(e) {
    const slider = e.target.closest('.custom-audio__slider');
    if (!slider) return;

    const container = slider.closest('.custom-audio');
    const audioEl = container.querySelector('.custom-audio__element');
    const timeDisplay = container.querySelector('.custom-audio__time');

    slider.dataset.isDragging = 'true';
    const percent = slider.value;
    slider.style.setProperty('--value', percent + '%');
    
    if (audioEl && audioEl.duration) {
      const time = (percent / 100) * audioEl.duration;
      timeDisplay.textContent = _formatTime(time);
    }

    // Use a one-time change listener for when dragging stops
    slider.onchange = () => {
      if (audioEl && audioEl.duration) {
        audioEl.currentTime = (slider.value / 100) * audioEl.duration;
      }
      slider.dataset.isDragging = 'false';
      slider.onchange = null;
    };
  }

  return { init };
})();

// Auto-initialize
document.addEventListener('DOMContentLoaded', AudioManager.init);
