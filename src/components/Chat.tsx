import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { Message } from '../types';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      parts: [{ text: "Salom! Men Chatgrap AI professional yordamchingman. Bugun sizga nima bilan yordam bera olaman?" }],
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: input }],
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.map(m => ({ role: m.role, parts: m.parts }))
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: data.text }],
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      // Fallback
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: "Kechirasiz, xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." }],
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="chat-module" className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-bottom border-gray-100 px-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">AI Assistant</h2>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide md:px-20 lg:px-44">
        <div className="space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                msg.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-none' 
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
                <span className="mt-1 text-[10px] text-gray-400 uppercase font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-5 py-3 border border-gray-100 rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-gray-500">O'ylayapman...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:px-20 lg:px-44 pb-8">
        <form 
          id="chat-form"
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip size={20} />
          </button>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingizni bering..."
            className="flex-1 bg-transparent px-4 py-2 text-[15px] outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1">
             <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
              <Mic size={20} />
            </button>
            <button
              id="send-button"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-[11px] text-gray-400">
          Chatgrap xato qilishi mumkin. Muhim ma'lumotlarni tekshirib ko'ring.
        </p>
      </div>
    </div>
  );
}
