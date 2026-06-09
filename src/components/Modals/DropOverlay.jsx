import React, { useState, useEffect } from 'react';

export default function DropOverlay({ onDrop }) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;
    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => e.preventDefault();
    
    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onDrop(file);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [onDrop]);

  if (!isDragging) return null;

  return (
    <div id="drop-overlay" className="visible">
      <div className="drop-overlay__inner">
        <div className="drop-overlay__icon">📂</div>
        <p className="drop-overlay__text">Drop your WhatsApp <code>.zip</code> or <code>.txt</code> export here</p>
      </div>
    </div>
  );
}
