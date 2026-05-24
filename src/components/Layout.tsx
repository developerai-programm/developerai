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
  Send as LucideSend,
  Settings,
  Moon,
  HelpCircle,
  Book,
  Users,
  Home,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { ViewType } from '../types';
import { RadialBackground } from './RadialBackground';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  user?: any;
}

export default function Layout({ children, activeView, onViewChange, user }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMuvofiqOpen, setIsMuvofiqOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'light';
  });

  const loadRecentChats = () => {
    const saved = localStorage.getItem('dev_ai_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentChats(parsed);
      } catch (e) {
        console.error('Error loading sidebar chat logs:', e);
      }
    } else {
      setRecentChats([]);
    }
  };

  React.useEffect(() => {
    loadRecentChats();
    const handleUpdate = () => {
      loadRecentChats();
    };
    window.addEventListener('dev_ai_conversations_updated', handleUpdate);
    return () => {
      window.removeEventListener('dev_ai_conversations_updated', handleUpdate);
    };
  }, []);

  const handleSelectChat = (chat: any) => {
    localStorage.setItem('dev_ai_active_conv_id_' + chat.type, chat.id);
    onViewChange(chat.type as ViewType);
    // Dispatch custom event to notify listeners
    window.dispatchEvent(new CustomEvent('dev_ai_conv_changed', {
      detail: { id: chat.id, type: chat.type, messages: chat.messages }
    }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const root = window.document.documentElement;
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMuvofiqOpen(false); // close submenu as well
  };

  const sections = [
    {
      title: 'Asosiy',
      items: [
        { id: 'chat', label: 'Matnli chat', icon: MessageSquare, disabled: false },
        { id: 'image', label: 'Rasm yasash', icon: ImageIcon, disabled: false },
        { id: 'code', label: 'Kod yozish', icon: Code, disabled: false },
        { id: 'search', label: 'Web izlash', icon: Globe, disabled: false },
        { id: 'browser', label: 'Web Brauzer', icon: Globe, disabled: false },
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
        <div className="flex h-14 items-center px-6 shrink-0 justify-between border-b border-gray-50 bg-gray-50/20">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/10">
              <Bot size={16} className="text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-black text-sm tracking-tight text-gray-900 whitespace-nowrap"
              >
                DEVELOPER AI
              </motion.span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-hide">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {!isCollapsed && (
                <h3 className="px-3 text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400 mb-1 mt-2 mb-1.5 opacity-80">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && onViewChange(item.id as ViewType)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150 group ${
                    activeView === item.id 
                      ? 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100/30' 
                      : item.disabled 
                        ? 'opacity-40 cursor-not-allowed grayscale text-gray-300'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? `${item.label}${item.disabled ? ' (Vaqtincha o\'chiq)' : ''}` : ''}
                >
                  <item.icon size={15} className={activeView === item.id ? 'text-blue-600' : 'group-hover:scale-105 transition-transform text-gray-400'} />
                  {!isCollapsed && (
                    <span className="font-semibold text-xs whitespace-nowrap">
                      {item.label}
                      {item.disabled && <span className="ml-1.5 text-[8px] font-bold text-gray-400">(O'chiq)</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
          
          <div className="pt-1.5 border-t border-gray-50">
            <button
               onClick={() => onViewChange('pricing')}
               className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150 group ${
                activeView === 'pricing' 
                  ? 'bg-purple-50 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
               <CreditCard size={15} className="text-gray-400 group-hover:text-purple-500" />
               {!isCollapsed && <span className="font-semibold text-xs">Ta'riflar</span>}
            </button>
          </div>

          {/* Suxbatlar Tarixi Section below folders */}
          {!isCollapsed && recentChats.length > 0 && (
            <div className="pt-3 border-t border-gray-100/80 mt-3 space-y-1">
              <h4 className="px-3 text-[9px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1.5 opacity-80 flex items-center gap-1">
                <MessageSquare size={11} className="text-gray-400" />
                Suhbatlar tarixi
              </h4>
              <div className="max-h-[160px] overflow-y-auto space-y-0.5 px-0.5 scrollbar-hide">
                {recentChats.slice(0, 10).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-900 truncate transition-all duration-150"
                    title={chat.title}
                  >
                    <span className="shrink-0 text-[8px] font-mono tracking-tighter bg-gray-100 border border-gray-200 text-gray-500 px-1 py-0.5 rounded uppercase font-bold transform select-none">
                      {chat.type === 'chat' ? 'CHAT' : chat.type === 'code' ? 'KOD' : chat.type === 'code-edit' ? 'TUZ' : 'TAHL'}
                    </span>
                    <span className="truncate flex-1 font-semibold">{chat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-100">
           {user && (
             <div className="relative">
               <div 
                 onClick={toggleUserMenu}
                 className={`flex items-center gap-3 p-2 rounded-xl border border-gray-50 bg-white hover:bg-gray-50 transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
               >
                 <Avatar className="h-9 w-9 ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all">
                   {user.photoURL ? (
                     <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                   ) : (
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs uppercase">
                      {(user.displayName || user.email || 'U')[0]}
                    </AvatarFallback>
                   )}
                 </Avatar>
                 {!isCollapsed && (
                   <div className="flex-1 min-w-0 pr-2">
                     <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || user.email?.split('@')[0]}</p>
                     <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                   </div>
                 )}
               </div>

               {/* Dropdown Menu */}
               <AnimatePresence>
                 {isUserMenuOpen && (
                   <>
                     {/* Backdrop to close menu */}
                     <div 
                       className="fixed inset-0 z-40" 
                       onClick={() => setIsUserMenuOpen(false)}
                     />
                     
                     <motion.div
                       initial={{ opacity: 0, scale: 0.95, y: isCollapsed ? 0 : 10 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95, y: 10 }}
                       className={`absolute ${isCollapsed ? 'left-full ml-4 bottom-0' : 'bottom-full mb-3 left-0 right-0'} z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[240px]`}
                     >
                       {/* User Header in Menu (Optional version matching image) */}
                       <div className="px-4 py-3 border-b border-gray-50 mb-1">
                         <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                             {user.photoURL ? (
                               <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                             ) : (
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {(user.displayName || user.email || 'U')[0]}
                              </AvatarFallback>
                             )}
                           </Avatar>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || user.email?.split('@')[0]}</p>
                             <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                           </div>
                         </div>
                       </div>

                        <div className="px-1.5 space-y-0.5">
                          <button 
                            onClick={() => {
                              onViewChange('profile');
                              setIsUserMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${activeView === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                          >
                            <UserIcon size={18} className={activeView === 'profile' ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="flex-1 text-left">Profil</span>
                          </button>
                          <button 
                            onClick={() => {
                              onViewChange('profile');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            <Settings size={18} className="text-gray-400" />
                            <span className="flex-1 text-left">Sozlamalar</span>
                            <span className="text-[10px] text-gray-300 font-medium">Ctrl .</span>
                          </button>
                        </div>

                        <div className="my-1 border-t border-gray-50 mx-1.5" />

                        <div className="px-1.5 space-y-0.5 relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsMuvofiqOpen(!isMuvofiqOpen);
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${isMuvofiqOpen ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                          >
                            <Moon size={18} className={isMuvofiqOpen ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="flex-1 text-left">Muvofiq ko'rinish</span>
                            <ChevronRightIcon size={14} className={`text-gray-400 transition-transform duration-200 ${isMuvofiqOpen ? 'rotate-90 text-blue-600' : ''}`} />
                          </button>

                          {/* Embedded vertical accordion to prevent visual clipping */}
                          <AnimatePresence>
                            {isMuvofiqOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-gray-50/80 rounded-xl border border-gray-100/50 p-3 my-1 space-y-3.5 text-left"
                              >
                                <div className="space-y-4">
                                  {/* Background block */}
                                  <div className="space-y-1.5">
                                    <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Muvofiq Fon</h4>
                                    <div className="flex gap-2">
                                      <div className="relative group cursor-pointer border-2 border-blue-500 rounded-lg p-0.5 shadow-sm">
                                        <div className="w-12 h-6 bg-gradient-to-tr from-pink-400 via-sky-300 to-indigo-500 rounded-md" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border-t border-gray-200/55" />

                                  {/* Theme list */}
                                  <div className="space-y-1">
                                    <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Mavzu (Theme)</h4>
                                    
                                    <button 
                                      onClick={() => handleThemeChange('light')}
                                      className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors ${theme === 'light' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
                                    >
                                      <span>Yorug' (Light)</span>
                                      {theme === 'light' && <span className="text-blue-600 text-xs font-bold">✓</span>}
                                    </button>

                                    <button 
                                      onClick={() => handleThemeChange('dark')}
                                      className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors ${theme === 'dark' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
                                    >
                                      <span>Tungi (Dark)</span>
                                      {theme === 'dark' && <span className="text-blue-600 text-xs font-bold">✓</span>}
                                    </button>

                                    <button 
                                      onClick={() => handleThemeChange('system')}
                                      className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors ${theme === 'system' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
                                    >
                                      <span>Tizim (System)</span>
                                      {theme === 'system' && <span className="text-blue-600 text-xs font-bold">✓</span>}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="px-1.5 space-y-0.5">
                          <button className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                            <HelpCircle size={18} className="text-gray-400" />
                            <span className="flex-1 text-left">Yordam</span>
                            <ChevronRightIcon size={14} className="text-gray-300" />
                          </button>
                          <button className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                            <Book size={18} className="text-gray-400" />
                            <span className="flex-1 text-left">Hujjatlar</span>
                            <ChevronRightIcon size={14} className="text-gray-300" />
                          </button>
                          <button className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                            <Users size={18} className="text-gray-400" />
                            <span className="flex-1 text-left">Hamjamiyat</span>
                          </button>
                          <button 
                            onClick={() => {
                              onViewChange('chat');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            <Home size={18} className="text-gray-400" />
                            <span className="flex-1 text-left">Bosh sahifa</span>
                          </button>
                        </div>

                       <div className="my-1 border-t border-gray-50 mx-1.5" />

                       <div className="px-1.5">
                         <button 
                           onClick={() => signOut(auth)}
                           className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                         >
                           <LogOut size={18} />
                           <span className="flex-1 text-left">Chiqish</span>
                         </button>
                       </div>
                     </motion.div>
                   </>
                 )}
               </AnimatePresence>
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
