import { useState, useCallback } from 'react';
import { MediaStorage } from '../utils/mediaStorage';

export function useMediaStore() {
  const [mediaStore, setMediaStore] = useState(new Map());

  const addMediaUrls = useCallback((newUrlsMap) => {
    setMediaStore(prev => new Map([...prev, ...newUrlsMap]));
  }, []);

  const getMediaUrl = useCallback(async (activeId, filename) => {
    if (!activeId || !filename) return null;
    const key = `${activeId}|${filename}`;
    if (mediaStore.has(key)) return mediaStore.get(key);
    
    const blob = await MediaStorage.loadMedia(activeId, filename);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setMediaStore(prev => new Map(prev).set(key, url));
      return url;
    }
    return null;
  }, [mediaStore]);

  return { mediaStore, addMediaUrls, getMediaUrl };
}
