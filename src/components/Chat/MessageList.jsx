import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import SystemMessage from './SystemMessage';
import { WhatsAppParser } from '../../utils/parser';

export default function MessageList({ messages, myName }) {
  const processedMessages = useMemo(() => {
    const result = [];
    let prevDate = null;
    let prevSender = null;
    let prevType = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const next = messages[i + 1] || null;

      const msgDateKey = WhatsAppParser.dateKey(msg.timestamp);
      
      if (msgDateKey !== prevDate) {
        result.push({
          isDivider: true,
          dateLabel: WhatsAppParser.formatDateDivider(msg.timestamp),
          id: `divider-${msgDateKey}-${i}`
        });
        prevDate = msgDateKey;
        prevSender = null;
      }

      if (msg.type === 'system') {
        result.push({ ...msg, isSystem: true, id: `sys-${i}` });
        prevSender = null;
        prevType = 'system';
        continue;
      }

      const isStandalone = (m) => {
        if (!m || m.type === 'system') return false;
        if (m.mediaType === 'sticker') return true;
        if (m.text && /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+$/u.test(m.text) && m.text.trim().length <= 12) return true;
        return false;
      };

      const prevMsg = i > 0 ? messages[i - 1] : null;
      const currentIsStandalone = isStandalone(msg);
      
      const isFirst = currentIsStandalone || isStandalone(prevMsg) || prevSender !== msg.sender || prevType === 'system';
      const isLast = currentIsStandalone || isStandalone(next) || !next || next.sender !== msg.sender || next.type === 'system' ||
                     WhatsAppParser.dateKey(next.timestamp) !== msgDateKey;

      const groupClass = isFirst && isLast ? '' :
                         isFirst ? 'group-top' :
                         isLast ? 'group-bottom' : 'group-middle';

      result.push({
        ...msg,
        groupClass,
        showSender: isFirst,
        id: `msg-${i}`
      });

      prevSender = msg.sender;
      prevType = 'message';
    }
    return result;
  }, [messages]);

  const renderItem = (index, item) => {
    if (item.isDivider) return <DateDivider label={item.dateLabel} />;
    if (item.isSystem) return <SystemMessage text={item.text} />;
    return <MessageBubble msg={item} myName={myName} />;
  };

  return (
    <Virtuoso
      data={processedMessages}
      itemContent={renderItem}
      initialTopMostItemIndex={processedMessages.length - 1}
      followOutput="smooth"
      style={{ height: '100%' }}
      className="messages-inner"
    />
  );
}
