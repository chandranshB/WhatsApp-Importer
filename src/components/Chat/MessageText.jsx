import React from 'react';

export default function MessageText({ text }) {
  if (!text) return null;
  
  const urlRe = /(https?:\/\/[^\s<>"']+)/g;
  const parts = text.split(urlRe);
  
  return (
    <span className="bubble-text">
      {parts.map((part, i) => {
        if (part.match(urlRe)) {
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
        }
        return part;
      })}
    </span>
  );
}
