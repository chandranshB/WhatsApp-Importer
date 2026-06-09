import React from 'react';

export default function ChatEmptyState() {
  const triggerImport = () => {
    document.getElementById('hidden-file-input').click();
  };

  return (
    <div id="empty-state" className="empty-state">
      <div className="empty-state__bubbles" aria-hidden="true">
        <div className="empty-state__bubble empty-state__bubble--in">Hey! 👋</div>
        <div className="empty-state__bubble empty-state__bubble--out">Open a chat →</div>
        <div className="empty-state__bubble empty-state__bubble--in">Or import one!</div>
      </div>
      <h2 className="empty-state__title">Welcome to WhatsApp Export Viewer</h2>
      <p className="empty-state__desc">Import your exported WhatsApp chats<br/>(.txt or .zip file) and read them beautifully.</p>
      <button className="btn btn--primary btn--lg" onClick={triggerImport}>
        Import a Chat
      </button>
      <p className="empty-state__hint">Or drag &amp; drop a <strong>.zip</strong> or .txt file anywhere</p>
    </div>
  );
}
