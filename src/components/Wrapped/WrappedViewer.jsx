import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Storage } from '../../utils/storage';
import { generateWrappedStats } from '../../utils/wrappedAnalytics';
import WrappedSlide from './WrappedSlide';

const SLIDE_DURATION = 8000; // 8 seconds per slide
const TOTAL_SLIDES = 13;

export default function WrappedViewer({ chatId, myName, customNames, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef(null);
  const progressStartRef = useRef(Date.now());

  const handleClose = useCallback(() => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(err => console.log(err));
      }
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    // Load and process
    const timer = setTimeout(() => {
      const chat = Storage.loadChat(chatId);
      if (chat && chat.messages) {
        const generatedStats = generateWrappedStats(chat.messages, myName, customNames);
        setStats(generatedStats);
      }
      setLoading(false);
    }, 500); // small delay for nice loading animation

    return () => clearTimeout(timer);
  }, [chatId, myName]);

  const goToNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(c => c + 1);
      progressStartRef.current = Date.now();
    }
  }, [currentSlide]);

  const goToPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(c => c - 1);
      progressStartRef.current = Date.now();
    }
  }, [currentSlide]);

  useEffect(() => {
    if (loading || !stats || isPaused) {
      clearInterval(progressInterval.current);
      return;
    }

    // Reset progress start when slide changes or unpaused
    progressStartRef.current = Date.now();
    
    progressInterval.current = setInterval(() => {
      const now = Date.now();
      if (now - progressStartRef.current >= SLIDE_DURATION) {
        goToNext();
      }
    }, 100);

    return () => clearInterval(progressInterval.current);
  }, [currentSlide, isPaused, loading, stats, goToNext]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, handleClose]);

  const handlePointerDown = (e) => {
    setIsPaused(true);
  };

  const handlePointerUp = (e) => {
    setIsPaused(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      goToPrev();
    } else if (x > rect.width * 0.7) {
      goToNext();
    }
  };

  if (loading) {
    return (
      <div className="wrapped-viewer-container loading">
        <div className="spinner"></div>
        <p>Analyzing your chats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="wrapped-viewer-container error">
        <p>Could not analyze this chat. Not enough data.</p>
        <button className="btn btn--ghost mt-4" onClick={handleClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="wrapped-viewer-container">
      <div className="wrapped-story-card" 
           onPointerDown={handlePointerDown}
           onPointerUp={handlePointerUp}
           onPointerLeave={() => setIsPaused(false)}>
           
        <div className="wrapped-progress-container">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <div key={idx} className="wrapped-progress-bar">
              <div 
                className="wrapped-progress-fill"
                style={{
                  width: idx < currentSlide ? '100%' : idx === currentSlide ? `${isPaused ? 'auto' : '100%'}` : '0%',
                  transition: idx === currentSlide && !isPaused ? `width ${SLIDE_DURATION}ms linear` : 'none',
                  animationName: idx === currentSlide && !isPaused ? 'fill-progress' : 'none',
                  animationDuration: `${SLIDE_DURATION}ms`,
                  animationTimingFunction: 'linear',
                  animationPlayState: isPaused ? 'paused' : 'running'
                }}
              />
            </div>
          ))}
        </div>

        <WrappedSlide slideIndex={currentSlide} stats={stats} />
        
        <button 
          className="wrapped-close-btn" 
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <X size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
