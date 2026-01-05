import React, { useState, useRef, useEffect } from 'react';
import { InvestigationCase, Message } from '../types';
import { detectiveAI } from '../services/geminiService';

interface AIAssistantProps {
  activeCase: InvestigationCase;
  onAnalyzeTimeline?: () => void;
  onAnalyzeSuspect?: (suspectId: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ activeCase, onAnalyzeTimeline, onAnalyzeSuspect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "I am ready to assist you with the case. What shall we investigate?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await detectiveAI.analyzeCase(activeCase, messageToSend);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "I apologize, but I was unable to process your request at this moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = async (type: 'timeline' | 'suspect' | 'theory', id?: string) => {
    if (type === 'timeline') {
      if (onAnalyzeTimeline) onAnalyzeTimeline();
      await handleSend("Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
    } else if (type === 'suspect' && id) {
      if (onAnalyzeSuspect) onAnalyzeSuspect(id);
      const suspect = activeCase.parties.find(s => s.id === id); // Use parties as suspects
      if (suspect) {
        await handleSend(`Analyze suspect ${suspect.name}. Examine their alibi, motive, and any statements they've made.`);
      }
    } else if (type === 'theory' && id) {
      const theory = activeCase.theories.find(t => t.id === id);
      if (theory) {
        await handleSend(`Challenge this theory: "${theory.title} - ${theory.content}". Find any flaws or contradictions.`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border-l border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
        <div>
          <h3 className="text-sm font-medium text-white tracking-wide uppercase">Investigation Assistant</h3>
          <p className="text-xs text-white/40 mt-1">Powered by Advanced AI</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500/50'}`} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPrompt('timeline')}
            disabled={isTyping}
            className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all rounded-sm disabled:opacity-50"
          >
            Analyze Timeline
          </button>
          {/* Fallback to empty array if parties is undefined, though it should be there */}
          {(activeCase.parties || []).slice(0, 3).map(suspect => (
            <button
              key={suspect.id}
              onClick={() => handleQuickPrompt('suspect', suspect.id)}
              disabled={isTyping}
              className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all rounded-sm disabled:opacity-50"
            >
              Suspect: {suspect.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-full group`}>
            <span className="text-[9px] uppercase tracking-widest text-white/20 mb-2 px-1">
              {m.role === 'assistant' ? 'AI Analyst' : 'You'}
            </span>
            <div className={`p-4 rounded-sm text-sm leading-relaxed max-w-[90%] ${m.role === 'assistant'
                ? 'bg-[#111] border border-white/10 text-white/80'
                : 'bg-white/5 border border-white/10 text-white/90'
              }`}>
              {m.content}
            </div>
            <span className="text-[8px] text-white/10 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[9px] uppercase tracking-widest text-white/20 mb-2 px-1">AI Analyst</span>
            <div className="bg-[#111] border border-white/10 p-4 rounded-sm">
              <div className="flex gap-1.5">
                <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Enter your inquiry..."
            disabled={isTyping}
            className="w-full bg-[#111] border border-white/10 focus:border-white/20 p-4 pr-12 text-sm text-white/90 outline-none h-24 resize-none transition-all placeholder:text-white/20 rounded-sm disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute bottom-4 right-4 p-2 text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <div className="mt-3 text-[9px] uppercase tracking-widest text-white/20 text-right">
          Press Enter to send
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
