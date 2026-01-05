
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  typingStatus?: string; // 新增属性：具体的加载状态文本
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, typingStatus }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, typingStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                {msg.role === 'user' ? '我' : 'AI'}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="flex gap-3 max-w-[70%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                AI
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                {typingStatus ? (
                  // 当有具体状态文本时（例如：正在搜索数据库...）
                  <>
                    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-medium text-indigo-600 animate-pulse">{typingStatus}</span>
                  </>
                ) : (
                  // 默认的三个跳动点
                  <>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="询问商品、订单或政策详情..."
            className="flex-grow py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
        <p className="text-[10px] text-center mt-3 text-slate-400 uppercase tracking-widest font-medium">
          由 AI 提供支持 • 中英双语支持
        </p>
      </div>
    </div>
  );
};
