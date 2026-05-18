import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Loader2, Sparkles, Plus, Mic, Paperclip, ChevronDown, Share2 } from 'lucide-react';
import { Message } from '../types';
import { PromptInputBox } from './PromptInputBox';

interface ChatViewProps {
  type?: string;
}

export default function ChatView({ type = 'chat' }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: message.trim() }],
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await globalThis.fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.trim(),
          type: type,
          history: messages.map(m => ({ role: m.role, parts: m.parts }))
        })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: data.text || data.error || "Xatolik yuz berdi" }],
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Top Banner (Optional for context) */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/20 backdrop-blur-md z-20">
         <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{type === 'chat' ? 'Asosiy chat' : type === 'code' ? 'Kod generator' : type === 'code-edit' ? 'Kod taxrirlash' : type === 'translate' ? 'Tarjima' : 'Fayl tahlili'}</span>
         </div>
         <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-900 transition-colors">
               <Share2 size={18} />
            </button>
         </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 scrollbar-hide flex flex-col items-center"
      >
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-32 text-center max-w-2xl px-6"
          >
            <div className="h-20 w-20 rounded-[32px] bg-blue-600 shadow-xl shadow-blue-600/20 flex items-center justify-center mb-10 translate-y-0 hover:-translate-y-1 transition-transform cursor-pointer">
              <Bot className="text-white" size={36} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">Qanday yordam bera olaman?</h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              DEVELOPER AI bilan suhbatlashing, kod yozing yoki istalgan ma'lumotni tahlil qiling.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
               {[
                 { title: 'Insho yozish', text: 'AI kelajagi haqida...' },
                 { title: 'Kod tahlili', text: 'React hooklarini tushuntiring' },
                 { title: 'Tarjima qilish', text: 'Ingliz tiliga o\'girish' },
                 { title: 'Rasm tavsifi', text: 'Tabiat manzarasi...' }
               ].map((sample, i) => (
                 <button 
                  key={i}
                  onClick={() => handleSend(sample.text)}
                  className="p-4 rounded-2xl border border-gray-100 bg-white text-left hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                 >
                   <p className="text-sm font-bold text-gray-900 mb-1">{sample.title}</p>
                   <p className="text-xs text-gray-500 group-hover:text-blue-600 truncate">{sample.text}</p>
                 </button>
               ))}
            </div>
          </motion.div>
        )}

        <div className="w-full max-w-4xl px-6 py-10 space-y-10">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : ''} max-w-[85%]`}>
                <div className={`rounded-[24px] px-6 py-4 text-[16px] leading-[1.7] transition-all ${
                  msg.role === 'user' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-3 rounded-[24px] px-6 py-4 bg-gray-50 border border-gray-100">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm font-bold text-gray-500">DEVELOPER AI javob yozmoqda...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input UI */}
      <div className="p-6 md:p-10 flex justify-center shrink-0 bg-transparent">
        <PromptInputBox 
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
