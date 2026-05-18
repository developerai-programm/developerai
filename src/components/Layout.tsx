import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Code, 
  Globe, 
  BarChart2, 
  Video, 
  Music, 
  Languages,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Bot,
  LogIn,
  Layers,
  FileSearch,
  Paintbrush,
  CreditCard,
  User as UserIcon,
  LogOut,
  Send as LucideSend
} from 'lucide-react';
import { ViewType } from '../types';
import { RadialBackground } from './RadialBackground';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  user?: any;
}

export default function Layout({ children, activeView, onViewChange, user }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    {
      title: 'Asosiy',
      items: [
        { id: 'chat', label: 'Matnli chat', icon: MessageSquare, disabled: false },
        { id: 'image', label: 'Rasm yasash', icon: ImageIcon, disabled: false },
        { id: 'code', label: 'Kod yozish', icon: Code, disabled: false },
        { id: 'search', label: 'Web izlash', icon: Globe, disabled: false },
      ]
    },
    {
      title: 'Taxrirlash',
      items: [
        { id: 'image-edit', label: 'Rasm taxrirlash', icon: Paintbrush, disabled: false },
        { id: 'code-edit', label: 'Kod taxrirlash', icon: Layers, disabled: false },
      ]
    },
    {
      title: 'Tahlil',
      items: [
        { id: 'analyze', label: 'Rasm tahlili', icon: BarChart2, disabled: false },
        { id: 'file-analyze', label: 'File tahlili', icon: FileSearch, disabled: false },
      ]
    },
    {
      title: 'Multimediya',
      items: [
        { id: 'video', label: 'Video yaratish', icon: Video, disabled: false },
        { id: 'music', label: 'Musiqa yaratish', icon: Music, disabled: false },
        { id: 'translate', label: 'Tarjima', icon: Languages, disabled: false },
      ]
    }
  ];

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 84 : 280 }}
        className="relative flex flex-col glass-dark h-full border-r border-gray-100 z-50 overflow-hidden bg-white shadow-sm"
      >
        {/* Header */}
        <div className="flex h-20 items-center px-6 shrink-0 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Bot size={22} className="text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-bold text-lg tracking-tight text-gray-900 whitespace-nowrap"
              >
                DEVELOPER AI
              </motion.span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-hide">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && onViewChange(item.id as ViewType)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group ${
                    activeView === item.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : item.disabled 
                        ? 'opacity-40 cursor-not-allowed grayscale text-gray-300'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? `${item.label}${item.disabled ? ' (Vaqtincha o\'chiq)' : ''}` : ''}
                >
                  <item.icon size={20} className={activeView === item.id ? 'text-blue-600' : 'group-hover:scale-110 transition-transform'} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                      {item.disabled && <span className="ml-2 text-[10px] font-bold text-gray-400">(O'chiq)</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
          
          <div className="pt-2">
            <button
               onClick={() => onViewChange('pricing')}
               className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group ${
                activeView === 'pricing' 
                  ? 'bg-purple-50 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
               <CreditCard size={20} />
               {!isCollapsed && <span className="font-medium text-sm">Ta'riflar</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-100">
           {user && (
             <div className={`flex items-center gap-3 p-2 rounded-xl mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
               <Avatar className="h-9 w-9 ring-2 ring-blue-50">
                 <AvatarFallback className="bg-blue-600 text-white font-bold text-xs uppercase">
                   {user.name?.[0] || 'U'}
                 </AvatarFallback>
               </Avatar>
               {!isCollapsed && (
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                   <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                 </div>
               )}
             </div>
           )}
           {!isCollapsed && !user && (
             <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-white transition-all hover:bg-gray-800 shadow-md">
               <LogIn size={18} />
               <span className="text-sm font-bold">Kirish</span>
             </button>
           )}
           {isCollapsed && (
             <button className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg">
               <LogIn size={20} />
             </button>
           )}
           <a 
            href="https://t.me/developerairobot" 
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LucideSend size={18} />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Telegram Bot</span>}
          </a>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col h-full overflow-hidden">
        <RadialBackground />
        <div className="relative z-10 flex-1 flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
