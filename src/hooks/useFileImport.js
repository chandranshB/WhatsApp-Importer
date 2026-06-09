import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Storage } from '../utils/storage';
import { MediaStorage } from '../utils/mediaStorage';
import { WhatsAppParser } from '../utils/parser';

const getMimeType = (ext) => {
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif',  webp: 'image/webp', bmp: 'image/bmp',
    heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
    mp4: 'video/mp4',   mov: 'video/quicktime', avi: 'video/x-msvideo',
    '3gp': 'video/3gpp', mkv: 'video/x-matroska', webm: 'video/webm',
    opus: 'audio/ogg',  ogg: 'audio/ogg',  mp3: 'audio/mpeg',
    m4a:  'audio/mp4',  aac: 'audio/aac',  wav: 'audio/wav', amr: 'audio/amr',
    pdf:  'application/pdf',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:  'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext.toLowerCase()] || null;
};

export function useFileImport(addMediaUrls, saveNewChat) {
  const [pendingParse, setPendingParse] = useState(null);
  const [isNameModalOpen, setNameModalOpen] = useState(false);

  const processText = useCallback((text, filename, chatId = null) => {
    try {
      const result = WhatsAppParser.parse(text);
      if (!result.messages.length) return alert('No messages found.');
      if (!result.participants.length) return alert('No participants found.');
      
      setPendingParse({ ...result, filename, chatId });
      setNameModalOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to parse chat.');
    }
  }, []);

  const handleZipFile = useCallback(async (file) => {
    try {
      const zip = await JSZip.loadAsync(file);
      let txtEntry = null;
      let txtName = '';
      
      zip.forEach((relativePath, entry) => {
        if (entry.dir) return;
        const lower = relativePath.toLowerCase();
        if (lower.endsWith('.txt') && (!txtEntry || lower.includes('chat'))) {
          txtEntry = entry;
          txtName = relativePath;
        }
      });

      if (!txtEntry) {
        alert('No chat .txt found inside this ZIP.');
        return;
      }

      const pendingChatId = Storage.generateId();
      const mediaJobs = [];
      const newUrlsMap = new Map();
      
      zip.forEach((relativePath, entry) => {
        if (entry.dir || relativePath.toLowerCase().endsWith('.txt')) return;
        const filename = relativePath.split('/').pop();
        const ext = filename.split('.').pop().toLowerCase();
        const mime = getMimeType(ext);
        if (!mime) return;
        
        mediaJobs.push(
          entry.async('arraybuffer').then(async buf => {
            const blob = new Blob([buf], { type: mime });
            const url = URL.createObjectURL(blob);
            newUrlsMap.set(`${pendingChatId}|${filename}`, url);
            await MediaStorage.saveMedia(pendingChatId, filename, blob);
          })
        );
      });
      
      await Promise.all(mediaJobs);
      addMediaUrls(newUrlsMap);

      const text = await txtEntry.async('string');
      const hintName = file.name.replace(/\.zip$/i, '.txt') || txtName;
      processText(text, hintName, pendingChatId);
    } catch (err) {
      console.error(err);
      alert('Could not read ZIP file.');
    }
  }, [addMediaUrls, processText]);

  const readTxtFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = e => processText(e.target.result, file.name);
    reader.onerror = () => alert('Could not read the file.');
    reader.readAsText(file, 'utf-8');
  }, [processText]);

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    
    if (name.endsWith('.zip')) {
      await handleZipFile(file);
    } else if (name.endsWith('.txt')) {
      await readTxtFile(file);
    } else {
      alert('Please select a WhatsApp export .txt or .zip file.');
    }
  }, [handleZipFile, readTxtFile]);

  const confirmName = useCallback((myName, chatName) => {
    if (!pendingParse) return;
    const { messages, participants, chatId, filename } = pendingParse;
    const id = chatId || Storage.generateId();
    
    const validDates = messages.map(m => m.timestamp).filter(d => d instanceof Date && !isNaN(d));
    const firstDate = validDates[0]?.toISOString() || null;
    const lastDate = validDates[validDates.length - 1]?.toISOString() || null;
    
    const lastMsg = [...messages].reverse().find(m => m.type === 'message' && m.text);
    const preview = lastMsg ? `${lastMsg.sender === myName ? 'You' : lastMsg.sender}: ${lastMsg.text.slice(0, 50)}` : null;

    const chat = {
      id, name: chatName || myName, myName,
      participants: participants.map(p => p.name),
      messageCount: messages.length,
      firstDate, lastDate, preview,
      importedAt: new Date().toISOString(),
      messages
    };

    saveNewChat(chat);
    setNameModalOpen(false);
    setPendingParse(null);
  }, [pendingParse, saveNewChat]);

  return {
    handleFileSelect,
    isNameModalOpen,
    setNameModalOpen,
    pendingParse,
    confirmName,
  };
}
