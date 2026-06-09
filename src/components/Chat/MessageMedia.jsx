import React from 'react';
import CustomAudioPlayer from './CustomAudioPlayer';

export default function MessageMedia({ msg, mediaUrl }) {
  if (!msg.mediaType) return null;
  
  if (!mediaUrl) {
    return (
      <div className="media-placeholder">
        <span className="media-placeholder__icon">🔄</span>
        <span className="media-placeholder__label">{msg.mediaLabel || 'Loading Media...'}</span>
      </div>
    );
  }

  switch (msg.mediaType) {
    case 'image':
    case 'sticker':
      return (
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="bubble-media-img-wrap" title="Open full size">
          <img src={mediaUrl} alt={msg.mediaLabel} className="bubble-img" />
        </a>
      );
    case 'video':
      return (
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="bubble-media-video-wrap" title="Play Video" data-is-video="true">
          <video className="bubble-video-preview" preload="metadata" playsInline muted>
            <source src={`${mediaUrl}#t=0.001`} />
          </video>
          <div className="bubble-video-play-btn">▶</div>
        </a>
      );
    case 'audio':
      return <CustomAudioPlayer src={mediaUrl} />;
    case 'document':
      return (
        <div className="bubble-doc">
          <div className="bubble-doc__info">
            <span className="bubble-doc__name" title={msg.mediaLabel}>{msg.mediaLabel}</span>
          </div>
          <div className="bubble-doc__actions">
            <a href={mediaUrl} download={msg.mediaLabel} className="bubble-doc__action bubble-doc__action--download">
              Download
            </a>
          </div>
        </div>
      );
    default:
      return (
        <div className="media-placeholder">
          <span className="media-placeholder__icon">📎</span>
          <span className="media-placeholder__label">{msg.mediaLabel || 'Media'}</span>
        </div>
      );
  }
}
