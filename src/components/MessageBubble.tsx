'use client';

import { Message } from '@/types';
import AnalysisCard from './AnalysisCard';

interface Props {
  message: Message;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 마크다운 굵게(**text**) 간단 렌더링
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mr-2 mt-1">
          AI
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {isUser ? message.content : renderMarkdown(message.content)}
        </div>

        {/* AI 분석 카드 */}
        {!isUser && message.analysis && (
          <div className="w-full">
            <AnalysisCard analysis={message.analysis} />
          </div>
        )}

        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm shrink-0 ml-2 mt-1">
          환자
        </div>
      )}
    </div>
  );
}
