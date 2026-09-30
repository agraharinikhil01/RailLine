import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
} from 'lucide-react';
import { aiService, ChatHistoryItem } from '../../services/aiService';
import { LiveTrainStatus } from '@railline/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'rail-ai-engine';
}

export interface RailAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainNumber?: string;
  trainName?: string;
  liveStatus?: LiveTrainStatus | null;
}

export const RailAIChatModal: React.FC<RailAIChatModalProps> = ({
  isOpen,
  onClose,
  trainNumber,
  trainName,
  liveStatus,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Train abhi kahan hai?',
    'Kitna late chal rahi hai?',
    'Agla station kab aayega?',
    'Platform number kya hai?',
    'Beech ke passing stations kaunse hain?',
    'Pantry aur khane ki suvidha?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTrainName = trainName || liveStatus?.trainName || (trainNumber ? `Train ${trainNumber}` : 'Indian Railways');

  // Initialize initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: Message = {
        id: 'msg-init',
        role: 'assistant',
        content: trainNumber
          ? `Namaste! 🙏 Main **Ray (RailAI)** hoon, **${activeTrainName} (${trainNumber})** ka dedicated travel assistant.\n\nAap mujhse live location, delays, platform, non-stop passing stations ya travel tips ke baare me kuch bhi puch sakte hain!`
          : `Namaste! 🙏 Main **Ray (RailAI)** hoon, aapka personal Indian Railways AI assistant.\n\nAap mujhse kisi bhi train ka live status, platform, delay ya passing stations puch sakte hain. Kripya apna sawal puchein ya koi bhi train number batayein!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rail-ai-engine',
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, trainNumber, activeTrainName]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Prepare history for API
    const history: ChatHistoryItem[] = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await aiService.askRailAI(text, trainNumber, history);
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
        setSuggestedQuestions(response.suggestedQuestions);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Kshama karein, network mein problem aayi hai. Kripya thodi der baad dubara prayas karein.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rail-ai-engine',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      const initialGreeting: Message = {
        id: 'msg-init-reset',
        role: 'assistant',
        content: `Chat reset ho chuki hai. Aap **${activeTrainName}** ke baare me koi naya sawal puch sakte hain!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rail-ai-engine',
      };
      setMessages([initialGreeting]);
    }, 50);
  };

  if (!isOpen) return null;

  // Simple Markdown renderer for bold, lists, and linebreaks
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bullet list item
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const lineContent = isBullet ? line.trim().substring(1).trim() : line;

      // Parse bold tags **text**
      const parts = lineContent.split(/(\*\*[^*]+\*\*)/g);
      const parsed = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-slate-700 leading-relaxed">
            <span className="text-purple-500 font-bold">•</span>
            <span>{parsed}</span>
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-0.5 text-slate-700 leading-relaxed">
          {parsed}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl md:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[88vh] sm:h-[650px] max-h-[92vh] overflow-hidden border border-slate-200/80"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Ask Ray
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                  RailAI Assistant
                </span>
              </div>
              <p className="text-xs text-purple-100 font-medium truncate max-w-[280px] sm:max-w-[380px]">
                {trainNumber ? `${activeTrainName} (${trainNumber})` : 'Ask anything about Indian Railways'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-2 rounded-full hover:bg-white/15 text-purple-100 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-full hover:bg-white/15 text-purple-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TELEMETRY STRIP (if liveStatus available) */}
        {liveStatus && (
          <div className="bg-purple-50/70 border-b border-purple-100/80 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono text-slate-700 shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-800">
                {liveStatus.currentStation?.name || 'In Transit'}
              </span>
              {liveStatus.currentStation?.platform && (
                <span className="text-purple-700 font-bold bg-purple-100 px-1 rounded">
                  PF {liveStatus.currentStation.platform}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className={liveStatus.delayMinutes > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {liveStatus.delayMinutes > 0 ? `+${liveStatus.delayMinutes}m delay` : 'On Time'}
              </span>
              <span>•</span>
              <span className="text-slate-600 font-semibold">
                {liveStatus.location?.speedKmph ?? 0} km/h
              </span>
            </div>
          </div>
        )}

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>{renderFormattedContent(msg.content)}</div>
                  )}

                  <div
                    className={`mt-1.5 flex items-center gap-1 text-[9px] font-mono ${
                      isUser ? 'text-purple-200 justify-end' : 'text-slate-400 justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.source === 'gemini' && (
                      <span className="ml-1 text-purple-600 font-bold bg-purple-50 px-1 rounded">
                        ✨ Gemini AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-500 font-medium">Ray is analyzing live train data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED QUICK CHIPS */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Quick:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 transition-all hover:scale-102 active:scale-98 shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BOX */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-slate-100/80 rounded-2xl px-3.5 py-1.5 border border-slate-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={trainNumber ? `Ask anything about ${activeTrainName}...` : 'Type train question (e.g. 12556 ka live status)...'}
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden py-1.5"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-40 disabled:pointer-events-none shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by RailAI • Real-Time Telemetry</span>
            <span>Supports Hindi & English</span>
          </div>
        </div>
      </div>
    </div>
  );
};
