import React from 'react';

export default function SidebarEmptyState({ onImport }) {
  return (
    <div className="sidebar__empty visible">
      <div className="sidebar__empty-icon">💬</div>
      <p className="sidebar__empty-title">No chats yet</p>
      <p className="sidebar__empty-hint">Import a WhatsApp .txt or .zip export<br/>to get started</p>
      <button className="btn btn--primary btn--sm" onClick={onImport}>
        Import Chat
      </button>
    </div>
  );
}
