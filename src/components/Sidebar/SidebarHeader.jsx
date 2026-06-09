import React from 'react';
import { Moon, Sun, Palette, Upload } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function SidebarHeader({ toggleThemePicker, onImport }) {
  const { mode, toggleMode } = useChat();

  return (
    <div className="sidebar__header">
      <div className="sidebar__header-left">
        <span className="sidebar__brand">WhatsApp Viewer</span>
      </div>
      <div className="sidebar__header-right">
        <button className="icon-btn" onClick={toggleMode} aria-label="Toggle mode" title="Toggle mode">
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn" onClick={toggleThemePicker} aria-label="Switch theme" title="Change theme">
          <Palette size={20} />
        </button>
        <button className="icon-btn" onClick={onImport} aria-label="Import chat" title="Import chat (.txt or .zip)">
          <Upload size={20} />
        </button>
      </div>
    </div>
  );
}
