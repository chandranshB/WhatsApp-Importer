import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { THEMES } from '../../config/themes';

export default function ThemePicker({ isOpen, onClose }) {
  const { theme, toggleTheme } = useChat();
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && pickerRef.current && !pickerRef.current.contains(e.target) && !e.target.closest('[title="Change theme"]')) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div id="theme-picker" className="theme-picker" ref={pickerRef}>
      <p className="theme-picker__label">Choose a Theme</p>
      <div className="theme-picker__grid">
        {THEMES.map((t) => (
          <button 
            key={t.id}
            className={`theme-option ${theme === t.id ? 'active' : ''}`} 
            onClick={() => { toggleTheme(t.id); onClose(); }}
          >
            <span className={`theme-option__preview theme-option__preview--${t.id}`}>
              <span className="theme-option__bubble-in"></span>
              <span className="theme-option__bubble-out"></span>
            </span>
            <span className="theme-option__name">{t.name}</span>
            {theme === t.id && <span className="theme-option__check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
