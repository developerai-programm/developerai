import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  Cloud, 
  Globe, 
  Lock, 
  GitBranch, 
  Smartphone, 
  User, 
  Brain, 
  Wrench,
  ChevronLeft,
  ExternalLink,
  Camera,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ViewType } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ProfileViewProps {
  user: any;
  onViewChange: (view: ViewType) => void;
}

export default function ProfileView({ user, onViewChange }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState('workspace');
  const [workspaceName, setWorkspaceName] = useState(`${user?.displayName || 'User'}'s Workspace`);
  const [handle, setHandle] = useState('');

  const [gitToken, setGitToken] = useState(() => localStorage.getItem('dev_ai_github_pat') || '');
  const [gitRepo, setGitRepo] = useState('developerai-programm/developerai');
  const [gitExportType, setGitExportType] = useState<'code' | 'chats'>('code');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string; repoUrl?: string } | null>(null);

  const handleGitExport = async () => {
    if (!gitToken) {
      alert("Iltimos, GitHub Personal Access Token (PAT) kiriting.");
      return;
    }
    if (!gitRepo || !gitRepo.includes('/')) {
      alert("Repository formatini to'g'ri kiriting (Masalan: owner/repo).");
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    // Save token for future ease of use
    localStorage.setItem('dev_ai_github_pat', gitToken);

    let chats: any[] = [];
    if (gitExportType === 'chats') {
      const saved = localStorage.getItem('dev_ai_conversations');
      if (saved) {
        try {
          chats = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing chats:", e);
        }
      }
    }

    try {
      const response = await globalThis.fetch('/api/github/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: gitToken,
          repo: gitRepo,
          type: gitExportType,
          chats: chats
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setExportResult({
          success: true,
          message: data.message,
          repoUrl: data.repoUrl
        });
      } else {
        setExportResult({
          success: false,
          message: data.error || data.message || "GitHub-ga eksport qilishda xatolik yuz berdi."
        });
      }
    } catch (err: any) {
      setExportResult({
        success: false,
        message: err.message || "Tarmog'ingizda yoki backend-da xatolik yuz berdi."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const sidebarItems = [
    { id: 'workspace', label: 'Workspace', subLabel: workspaceName || 'My Workspace', icon: Globe, section: 'Workspace' },
    { id: 'people', label: 'People', icon: Users, section: 'Workspace' },
    { id: 'billing', label: 'Plans & credits', icon: CreditCard, section: 'Workspace' },
    { id: 'balance', label: 'Cloud & AI balance', icon: Cloud, section: 'Workspace' },
    { id: 'domains', label: 'Workspace domains', icon: Globe, section: 'Workspace' },
    { id: 'security', label: 'Privacy & security', icon: Lock, section: 'Workspace' },
    { id: 'git', label: 'Git', icon: GitBranch, section: 'Workspace' },
    { id: 'devices', label: 'Devices & apps', icon: Smartphone, section: 'Workspace' },
    { id: 'account', label: user?.displayName || 'User', icon: User, section: 'Account' },
    { id: 'knowledge', label: 'Knowledge', icon: Brain, section: 'Customize' },
    { id: 'skills', label: 'Skills', icon: Wrench, section: 'Customize' },
  ];

  const sections = ['Workspace', 'Account', 'Customize'];

  const handleTONPayment = () => {
    window.location.href = "ton://transfer/UQC4o86OTxG3dgST9Mzgy2sdhG4zovI-ynqkpqhtrIOj2kp3?amount=19272708569";
  };

  const handleCheckoutPayment = async () => {
    try {
      const response = await globalThis.fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'Pro',
          isAnnual: true,
          userId: user?.uid || 'user_id'
        })
      });
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("To'lov tizimida xatolik yuz berdi.");
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  return (
    <div className="flex h-full bg-[#f9fafb] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-white border-r border-gray-100 flex flex-col p-4">
        <button 
          onClick={() => onViewChange('chat' as ViewType)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Go back
        </button>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {sections.map(sectionName => (
            <div key={sectionName} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {sectionName}
              </h3>
              {sidebarItems
                .filter(item => item.section === sectionName)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium group ${
                      activeTab === item.id 
                        ? 'bg-[#f4f4f5] text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-1 rounded-md transition-colors ${
                      activeTab === item.id ? 'bg-white text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {item.id === 'workspace' ? (
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white">
                          I
                        </div>
                      ) : (
                        <item.icon size={18} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div>{item.label}</div>
                      {item.subLabel && activeTab !== item.id && (
                        <div className="text-[10px] text-gray-400 font-normal truncate max-w-[140px]">
                          {item.subLabel}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* Footer Connectors Mock */}
        <div className="mt-auto pt-6 px-3">
          <div className="bg-[#fbfcff] border border-blue-50 rounded-xl p-4 shadow-sm">
            <div className="flex gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <Smartphone size={14} className="text-blue-600" />
              </div>
              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                <Smartphone size={14} className="text-purple-600" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-900 mb-1">Connectors have moved</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Find the new connector experience on the homepage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'workspace' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Workspace settings</h1>
                  <p className="text-gray-500 mt-1">
                    Workspaces allow you to collaborate on projects in real time.
                  </p>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Open docs <ExternalLink size={14} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar Card */}
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">Avatar</h3>
                    <p className="text-sm text-gray-500">Set an avatar for your workspace.</p>
                  </div>
                  <div className="relative group cursor-pointer">
                    <Avatar className="h-16 w-16 text-lg font-bold ring-4 ring-gray-50 group-hover:ring-gray-100 transition-all">
                      {user?.photoURL ? (
                        <AvatarImage src={user.photoURL} />
                      ) : (
                        <AvatarFallback className="bg-purple-600 text-white text-xl">
                          I
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera size={20} />
                    </div>
                  </div>
                </div>

                {/* Name Card */}
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="mb-4">
                    <h3 className="font-bold text-gray-900">Name</h3>
                    <p className="text-sm text-gray-500">Your full workspace name, as visible to others.</p>
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      maxLength={50}
                      className="w-full px-4 py-2.5 bg-[#fbfcff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium"
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-gray-400 font-medium">{workspaceName.length} / 50 characters</span>
                    </div>
                  </div>
                </div>

                {/* Handle Card */}
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">Workspace handle</h3>
                      <p className="text-sm text-gray-500">Set a handle for the workspace profile page.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                      Set handle
                    </button>
                  </div>
                </div>

                {/* Credit Limit Card */}
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-gray-900">Default monthly member credit limit</h3>
                      <p className="text-sm text-gray-500">
                        The default monthly credit limit for members of this workspace. Leave empty to use no limit.
                      </p>
                    </div>
                    <div className="w-1/3">
                      <input 
                        type="text"
                        placeholder="Enter credit limit (optional)"
                        className="w-full px-4 py-2.5 bg-[#fbfcff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Workspace Card */}
                <div className="p-6 bg-red-50/30 border border-red-100 rounded-2xl">
                   <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">Leave workspace</h3>
                      <p className="text-sm text-gray-500">
                        You cannot leave your last workspace. Your account must be a member of at least one workspace.
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-red-100 text-red-500 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">
                      Leave workspace
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plans & credits</h1>
                <p className="text-gray-500 mt-1">
                  Manage your subscription and billing details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checkout.uz Option */}
                <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 transition-transform group-hover:scale-110">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Checkout.uz</h3>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    Uzbekistan kartalari orqali to'lovlarni amalga oshiring. Xavfsiz va tezkor.
                  </p>
                  <button 
                    onClick={handleCheckoutPayment}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                  >
                    Buy now
                  </button>
                </div>

                {/* TON Option */}
                <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group border-blue-100 bg-blue-50/20">
                   <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
                    <Smartphone size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">TON Wallet</h3>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    TON cryptocurrency orqali to'lovlarni amalga oshiring. Hech qanday komissiyasiz.
                  </p>
                  <button 
                    onClick={handleTONPayment}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Pay with TON
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3 border border-gray-100">
                <AlertCircle size={18} className="text-gray-400 mt-0.5" />
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  To'lovlar Checkout.uz va TON platformalari orqali xavfsiz amalga oshiriladi. 
                  Sizning karta ma'lumotlaringiz bizning serverda saqlanmaydi.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'git' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-in fade-in"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <GitBranch size={22} className="stroke-[2.5]" />
                    </span>
                    GitHub Eksport & Integratsiya
                  </h1>
                  <p className="text-gray-500 mt-1.5 text-sm">
                    DEVELOPER AI loyihangizning barcha kodlarini yoki to'liq chat suhbatlarini bir marta bosish orqali GitHub-ga yuboring.
                  </p>
                </div>
                <a 
                  href="https://github.com/settings/tokens/new?scopes=repo,write:org,admin:org" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex self-start items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-850 transition-colors bg-blue-50 hover:bg-blue-100/70 px-4 py-2 rounded-xl border border-blue-100"
                >
                  PAT token yaratish (GitHub) <ExternalLink size={12} />
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* PAT key */}
                  <div className="p-6 bg-white border border-gray-100/80 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        1. GitHub Personal Access Token (PAT)
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 lines-relaxed">
                        Kodlarni yuborish uchun faqatgina o'zingizning shaxsiy GitHub tokeningizdan foydalanasiz. Xavfsizlik nuqtai nazaridan token faqat brauzeringizda saqlanadi.
                      </p>
                    </div>

                    <div>
                      <input 
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={gitToken}
                        onChange={(e) => setGitToken(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-mono placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Target Repo */}
                  <div className="p-6 bg-white border border-gray-100/80 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Repozitoriya nomi (Repository Path)
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 lines-relaxed">
                        Yuboriladigan repozitoriya manzili. Agar ushbu repozitoriya profilingizda mavjud bo'lmasa, uni <b>avtomatik tarzda public</b> qilib ochib beramiz.
                      </p>
                    </div>

                    <div>
                      <input 
                        type="text"
                        placeholder="Masalan: owner/repo"
                        value={gitRepo}
                        onChange={(e) => setGitRepo(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div className="p-6 bg-white border border-gray-100/80 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        3. Yuklanadigan ma'lumot turi
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 lines-relaxed">
                        Loyiha kod fayllarini yoki mavjud bo'lgan barcha suhbatlar tarixini tanlab eksport qilishingiz mumkin.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setGitExportType('code')}
                        className={`flex-1 flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 text-center group ${
                          gitExportType === 'code'
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-gray-50/20'
                        }`}
                      >
                        <span className="text-2xl">📁</span>
                        <div className="text-xs font-bold">Loyiha kodlari va fayllar</div>
                        <div className="text-[10px] text-gray-400 font-medium">Barcha kodlar, App.tsx, server.ts ...</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGitExportType('chats')}
                        className={`flex-1 flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 text-center group ${
                          gitExportType === 'chats'
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-gray-50/20'
                        }`}
                      >
                        <span className="text-2xl">💬</span>
                        <div className="text-xs font-bold">Suhbatlar tarixi (Chat logs)</div>
                        <div className="text-[10px] text-gray-400 font-medium">Barcha suhbatlar (.md va .json)</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info and action */}
                <div className="space-y-6">
                  <div className="p-6 bg-[#fbfbfe] border border-blue-50 rounded-2xl space-y-5 shadow-sm">
                    <h4 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                      ℹ️ Ma'lumot-noma
                    </h4>
                    
                    <ul className="space-y-3 text-xs text-gray-650 leading-relaxed list-disc list-outside pl-4">
                      <li>Barcha operatsiyalar bevosita xavfsiz GitHub REST API protokoli yordamida ishonchli amalga oshiriladi.</li>
                      <li>Berilgan repozitoriya manzili (masalan: <code className="font-mono text-[11px] bg-blue-50 font-bold px-1.5 py-0.5 rounded text-blue-700">{gitRepo}</code>) sizning ruxsatingiz ostida boshqariladi.</li>
                      <li>Dasturning barcha muhim fayllari bitta yaxlit commit bilan silliq joylashtiriladi.</li>
                    </ul>

                    <div className="pt-2">
                      <button
                        onClick={handleGitExport}
                        disabled={isExporting}
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all text-white shadow-lg ${
                          isExporting 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 hover:-translate-y-0.5'
                        }`}
                      >
                        {isExporting ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Yuklanmoqda...</span>
                          </>
                        ) : (
                          <>
                            <GitBranch size={16} />
                            <span>GitHub-ga push qilish</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {exportResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-2xl border text-xs leading-relaxed space-y-4 shadow-sm ${
                        exportResult.success
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                          : 'bg-rose-50/50 border-rose-100 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{exportResult.success ? '🏆' : '⚠️'}</span>
                        <h4 className="font-black uppercase tracking-wider text-xs">
                          {exportResult.success ? "Muvaffaqiyatli saqlandi" : "Xatolik yuz berdi"}
                        </h4>
                      </div>

                      <p className="font-semibold text-gray-700 leading-relaxed">{exportResult.message}</p>

                      {exportResult.success && exportResult.repoUrl && (
                        <div className="pt-1">
                          <a
                            href={exportResult.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                          >
                            Repozitoriyani ochish (GitHub) <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'workspace' && activeTab !== 'billing' && activeTab !== 'git' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ushbu bo'lim tez orada ochiladi</h2>
              <p className="text-gray-500 mt-2 max-w-sm">
                Siz tanlagan "{sidebarItems.find(i => i.id === activeTab)?.label}" bo'limi ustida ish ketmoqda.
              </p>
              <button 
                onClick={() => setActiveTab('workspace')}
                className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Orqaga (Workspace)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
