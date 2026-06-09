import React from 'react';

export default function SystemMessage({ text }) {
  return (
    <div className="system-msg">
      <span className="system-msg__text">{text}</span>
    </div>
  );
}
