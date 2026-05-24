import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Loader2, Plus, Share2, History, Trash2, X, MessageSquare, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Message } from '../types';
import { PromptInputBox } from './PromptInputBox';
import { MessageFormatter } from './MessageFormatter';

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  type: string;
  timestamp: number;
}

interface ChatViewProps {
  type?: string;
}

export default function ChatView({ type = 'chat' }: ChatViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [codeModel, setCodeModel] = useState<'claude-opus' | 'lovable' | 'default'>(() => {
    return (localStorage.getItem('dev_ai_selected_code_model') as any) || 'claude-opus';
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations list from localStorage on mount and when type change
  useEffect(() => {
    const saved = localStorage.getItem('dev_ai_conversations');
    if (saved) {
      try {
        const parsed: Conversation[] = JSON.parse(saved);
        setConversations(parsed);
        
        // Find most recent conversation of this specific sub-type, or check override
        const overrideId = localStorage.getItem('dev_ai_active_conv_id_' + type);
        const relevant = parsed.filter(c => c.type === type);
        const matched = overrideId ? relevant.find(c => c.id === overrideId) : null;

        if (matched) {
          setCurrentConvId(matched.id);
          setMessages(matched.messages);
          localStorage.removeItem('dev_ai_active_conv_id_' + type);
        } else if (relevant.length > 0) {
          // sort descending by timestamp and load most recent
          relevant.sort((a, b) => b.timestamp - a.timestamp);
          setCurrentConvId(relevant[0].id);
          setMessages(relevant[0].messages);
        } else {
          setCurrentConvId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading conversations history:', err);
      }
    } else {
      setConversations([]);
      setCurrentConvId(null);
      setMessages([]);
    }
  }, [type]);

  // Listen to live conversation shifts from sidebar
  useEffect(() => {
    const handleGlobalConvShift = (e: CustomEvent) => {
      const { id, type: eventType, messages: eventMessages } = e.detail;
      if (eventType === type) {
        setCurrentConvId(id);
        setMessages(eventMessages);
      }
    };
    window.addEventListener('dev_ai_conv_changed' as any, handleGlobalConvShift as any);
    return () => {
      window.removeEventListener('dev_ai_conv_changed' as any, handleGlobalConvShift as any);
    };
  }, [type]);

  // Handle autosScroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const saveConversationState = (convId: string, updatedMessages: Message[]) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === convId);
      let updatedList: Conversation[] = [];
      
      if (idx !== -1) {
        // Update existing talk
        updatedList = [...prev];
        updatedList[idx] = {
          ...updatedList[idx],
          messages: updatedMessages,
          timestamp: Date.now()
        };
      } else {
        // Create new talk title and entry
        const firstUserText = updatedMessages.find(m => m.role === 'user')?.parts[0]?.text || 'Yangi suhbat';
        const cleanTitle = firstUserText.length > 28 ? firstUserText.slice(0, 26) + '...' : firstUserText;
        
        const newConv: Conversation = {
          id: convId,
          title: cleanTitle,
          messages: updatedMessages,
          type: type,
          timestamp: Date.now()
        };
        updatedList = [newConv, ...prev];
      }
      
      localStorage.setItem('dev_ai_conversations', JSON.stringify(updatedList));
      // Notify navigation sidebar to load the updated conversation list
      window.dispatchEvent(new CustomEvent('dev_ai_conversations_updated'));
      return updatedList;
    });
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: message.trim() }],
      timestamp: Date.now(),
    };

    const nextConversationId = currentConvId || Date.now().toString();
    const nextMessages = [...messages, userMsg];

    if (!currentConvId) {
      setCurrentConvId(nextConversationId);
    }
    
    setMessages(nextMessages);
    setIsLoading(true);

    // Persist user prompt immediately
    saveConversationState(nextConversationId, nextMessages);

    try {
      const response = await globalThis.fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.trim(),
          type: type,
          modelProvider: (type === 'code' || type === 'code-edit') ? codeModel : 'default',
          history: nextMessages.map(m => ({ role: m.role, parts: m.parts }))
        })
      });
      const data = await response.json();
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: data.text || data.error || "Xatolik yuz berdi" }],
        timestamp: Date.now(),
      };

      const finalMessages = [...nextMessages, modelMsg];
      setMessages(finalMessages);
      saveConversationState(nextConversationId, finalMessages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setCurrentConvId(null);
    setMessages([]);
  };

  const handleLoadConversation = (conv: Conversation) => {
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
    
    // Auto collapse drawer on small screen sizes
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    
    const updated = conversations.filter(c => c.id !== idToDelete);
    setConversations(updated);
    localStorage.setItem('dev_ai_conversations', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dev_ai_conversations_updated'));
    
    if (currentConvId === idToDelete) {
      setCurrentConvId(null);
      setMessages([]);
    }
  };

  const currentTypeTitle = type === 'chat' ? 'Asosiy chat' : type === 'code' ? 'Kod generator' : type === 'code-edit' ? 'Kod taxrirlash' : type === 'translate' ? 'Tarjima' : 'Fayl tahlili';
  const typeConversations = conversations.filter(c => c.type === type);

  return (
    <div id="chat-module-container" className="flex h-full w-full bg-transparent overflow-hidden relative font-sans">
      
      {/* 1. Left Conversation History panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-hidden relative shadow-sm z-30"
          >
            {/* Header of Panel */}
            <div className="h-16 px-4 border-b border-gray-50 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Suhbatlar tarixi</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-200/50 text-gray-400 hover:text-gray-900 rounded-lg transition-colors md:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Start New Chat Button */}
            <div className="p-3 border-b border-gray-50 shrink-0">
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-600 rounded-2xl text-xs font-bold transition-all shadow-sm border border-blue-100"
              >
                <Plus size={15} />
                Yangi suhbat boshlash
              </button>
            </div>

            {/* List of past conversations */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide bg-white select-none">
              {typeConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 self-center justify-self-center mt-6">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100/50 flex items-center justify-center mb-3">
                    <MessageSquare size={16} className="text-gray-300" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Suhbatlar yo'q</p>
                  <p className="text-[10px] text-gray-400 mt-1">Suhbatlarni boshlash uchun savolingizni yozib yuboring.</p>
                </div>
              ) : (
                typeConversations.map((conv) => {
                  const isActive = conv.id === currentConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv)}
                      className={`flex items-center justify-between group p-3 rounded-xl cursor-pointer transition-all border ${
                        isActive 
                          ? 'bg-blue-50/40 border-blue-100 text-blue-900 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare size={15} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="text-xs font-bold truncate pr-2">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/50 active:scale-90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="O'chirish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Chat Conversation Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Control Banner bar */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/40 backdrop-blur-md shadow-sm z-20">
          <div className="flex items-center gap-3">
            {/* History Toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-all active:scale-95 border border-gray-100"
              title={isSidebarOpen ? "Tarixni yopish" : "Tarixni ochish"}
            >
              <Menu size={16} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">{currentTypeTitle}</span>
              {currentConvId && (
                <span className="text-[10px] text-gray-400 select-none">ID: #{currentConvId.slice(-6)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 select-none">
            {(type === 'code' || type === 'code-edit') ? (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setCodeModel('claude-opus');
                    localStorage.setItem('dev_ai_selected_code_model', 'claude-opus');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight transition-all relative ${
                    codeModel === 'claude-opus'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 bg-transparent'
                  }`}
                  title="Claude 3 Opus - Premium limitsiz kod yozuvchi engin"
                >
                  <span>Claude Opus</span>
                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase tracking-wide ${
                    codeModel === 'claude-opus' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 border border-purple-100'
                  }`}>
                    CHEKSIZ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeModel('lovable');
                    localStorage.setItem('dev_ai_selected_code_model', 'lovable');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-tight transition-all relative ${
                    codeModel === 'lovable'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 bg-transparent'
                  }`}
                  title="Lovable - To'liq integratsiyalangan limitsiz full-stack kod tuzuvchi"
                >
                  <span>Lovable</span>
                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase tracking-wide ${
                    codeModel === 'lovable' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    CHEKSIZ
                  </span>
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                Online status: cheksiz limit
              </span>
            )}
          </div>
        </div>

        {/* Conversation messages board */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 scrollbar-hide flex flex-col items-center select-text bg-transparent"
        >
          {messages.length === 0 && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center pt-24 text-center max-w-2xl px-6 h-full my-auto"
            >
              {/* Construction Crane replacement with animated SVG sparks */}
              <div className="h-16 w-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center mb-8 relative select-none animate-bounce">
                <Bot className="text-white" size={30} />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 tracking-tight leading-normal">
                Sizga dasturlash va yechimlarda yordam beruvchi AI tizimi
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md font-sans">
                DEVELOPER AI yordamida tezkor ravishda kod shablonlarini tuzing, algoritmlarni muhokama qiling, yoki tarjima qiling.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl text-left select-none">
                 {[
                   { title: 'Python skriptlar va hisob-kitob', text: 'Mukammal python kodini yozib ber.' },
                   { title: 'React va CSS maslahatlar', text: 'Tailwind yordamida chiroyli karta tuzib ber.' },
                   { title: 'Fayllar va yangiliklar tahlili', text: 'Yirik ma\'lumotlarni qanday tahlil qilaman?' },
                   { title: 'Ingliz tiliga tarjimon', text: 'Ushbu gapni ingliz tiliga tarjima qil.' }
                 ].map((sample, i) => (
                   <button 
                     key={i}
                     onClick={() => handleSend(sample.text)}
                     className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/10 transition-all text-left duration-200"
                   >
                     <p className="text-xs font-bold text-gray-800 mb-1">{sample.title}</p>
                     <p className="text-[11px] text-gray-400 truncate font-semibold">{sample.text}</p>
                   </button>
                 ))}
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-4xl px-4 md:px-8 py-8 space-y-8 select-text">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm select-none ${
                    msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : ''} max-w-[85%] overflow-hidden`}>
                    <div className={`rounded-3xl px-5 py-4 text-[15px] leading-relaxed transition-all shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'bg-white border border-gray-100/60 text-gray-850'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                      ) : (
                        // Render formatted Markdown, highlight summaries and provide easy copy code blocks
                        <MessageFormatter text={msg.parts[0].text} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div id="loader-bubble" className="flex gap-4 md:gap-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                    <Bot size={18} />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-gray-100 shadow-sm">
                    <Loader2 size={15} className="animate-spin text-blue-600" />
                    <span className="text-xs font-bold text-gray-500 animate-pulse">DEVELOPER AI o'ylamoqda...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Input Area panel */}
        <div className="p-4 md:p-6 flex justify-center shrink-0 bg-transparent z-10">
          <PromptInputBox 
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
