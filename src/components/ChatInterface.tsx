'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ChatResponse } from '@/types';
import MessageBubble from './MessageBubble';

const QUICK_SYMPTOMS = [
  '목이 아프고 열이 나요',
  '머리가 심하게 아파요',
  '배가 아프고 설사를 해요',
  '기침이 계속 나요',
  '오른쪽 아래 배가 아파요',
  '가슴이 답답해요',
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  consultation_id: '',
  role: 'assistant',
  content: `안녕하세요! 저는 병원 AI 상담 도우미입니다. 😊\n\n증상이나 궁금하신 점을 편하게 말씀해 주세요. 증상 분석, 진료과 안내, 응급 여부 판단을 도와드립니다.\n\n⚠️ 저는 AI 상담 도우미로, 의사의 진단을 대체하지 않습니다. 정확한 진단은 반드시 의료진에게 받으세요.`,
  created_at: new Date().toISOString(),
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput('');

    const userMsg: Message = {
      id: crypto.randomUUID(),
      consultation_id: consultationId || '',
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          consultation_id: consultationId,
          history,
        }),
      });

      const data: ChatResponse & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.');

      if (!consultationId) setConsultationId(data.consultation_id);
      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          consultation_id: consultationId || '',
          role: 'assistant',
          content: `죄송합니다. 오류가 발생했습니다: ${msg}\n\n잠시 후 다시 시도해 주세요.`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, consultationId, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setConsultationId(null);
    setInput('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">병원 AI 상담봇</h1>
            <p className="text-xs text-gray-500">증상 분석 · 진료과 안내 · 응급 판단</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {consultationId && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              상담 중
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            새 상담
          </button>
        </div>
      </header>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mr-2 mt-1">
              AI
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 빠른 증상 버튼 (첫 메시지 전) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2 font-medium">자주 찾는 증상</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-blue-200 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {error && (
          <p className="text-xs text-red-500 mb-2 px-1">⚠️ {error}</p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="증상이나 궁금한 점을 입력하세요... (Enter로 전송)"
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white rounded-xl px-4 py-3 font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors h-[66px] flex items-center justify-center"
          >
            전송
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          이 서비스는 의료 조언이 아닙니다. 응급 시 119에 연락하세요.
        </p>
      </div>
    </div>
  );
}
