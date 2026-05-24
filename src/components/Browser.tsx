import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  AlertTriangle, 
  Home, 
  Sparkles,
  Server,
  Cpu,
  Database,
  Terminal as TerminalIcon,
  HardDrive,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  Network
} from 'lucide-react';

export default function Browser() {
  const [url, setUrl] = useState('https://uz.wikipedia.org/wiki/Bosh_sahifa');
  const [urlInput, setUrlInput] = useState('https://uz.wikipedia.org/wiki/Bosh_sahifa');
  const [history, setHistory] = useState<string[]>(['https://uz.wikipedia.org/wiki/Bosh_sahifa']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [showXFrameWarning, setShowXFrameWarning] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Custom Cloud Hosting States
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([
    "[SYSTEM] Awaiting cloud deployment instruction...",
  ]);
  const [serverStatus, setServerStatus] = useState<'online' | 'rebooting' | 'syncing'>('online');
  const [connectedServices, setConnectedServices] = useState({
    github: true,
    supabase: false,
    firebase: true,
    vercel: true,
    render: false
  });

  const navigateTo = (targetUrl: string) => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    // Support customized cloud path
    const isCloudPath = cleanUrl.toLowerCase() === 'cloud' || cleanUrl.toLowerCase() === '/cloud' || cleanUrl.toLowerCase().includes('://cloud');

    let finalizedUrl = cleanUrl;
    if (isCloudPath) {
      finalizedUrl = 'https://cloud';
    } else {
      const hasDot = cleanUrl.includes('.');
      const hasProtocol = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');

      if (!hasProtocol) {
        if (hasDot) {
          finalizedUrl = 'https://' + cleanUrl;
        } else {
          // Safe and clean search engine query loading
          finalizedUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanUrl)}`;
        }
      }
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalizedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setUrl(finalizedUrl);
    setUrlInput(finalizedUrl);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setUrl(history[prevIdx]);
      setUrlInput(history[prevIdx]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setUrl(history[nextIdx]);
      setUrlInput(history[nextIdx]);
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleHome = () => {
    navigateTo('https://uz.wikipedia.org/wiki/Bosh_sahifa');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  const handleDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep(0);
    setDeployLogs([
      `[${new Date().toLocaleTimeString()}] Starting new production container build...`,
      `[${new Date().toLocaleTimeString()}] Fetching source code from GitHub main branch...`,
      `[${new Date().toLocaleTimeString()}] Validating dependencies and configurations...`
    ]);

    const deploySteps = [
      `[${new Date().toLocaleTimeString()}] Running 'npm run build' inside Cloud Sandbox...`,
      `[${new Date().toLocaleTimeString()}] Compiling frontend Applet components...`,
      `[${new Date().toLocaleTimeString()}] Building lightweight Node.js Express server backend...`,
      `[${new Date().toLocaleTimeString()}] Success: Production bundle compiled into dist/server.cjs.`,
      `[${new Date().toLocaleTimeString()}] Copying assets and initializing Firestore connectors...`,
      `[${new Date().toLocaleTimeString()}] Starting fresh load balancer proxy route on port 3000...`,
      `[${new Date().toLocaleTimeString()}] Cloud Run service updated to revision developer-ai-v3.`,
      `[${new Date().toLocaleTimeString()}] DEPLOYMENT COMPLETED SUCCESSFULLY WITH 100% HEALTH CHECK!`
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < deploySteps.length) {
        setDeployLogs(prev => [...prev, deploySteps[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
      }
    }, 1000);
  };

  const handleReboot = () => {
    setServerStatus('rebooting');
    setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] Rebooting Node cluster containers...`]);
    setTimeout(() => {
      setServerStatus('online');
      setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] All containers have successfully booted.`]);
    }, 1500);
  };

  const popularLinks = [
    { name: 'Wikiproject Cloud', url: '/cloud', desc: 'Soliq & Hosting Cloud platformasi' },
    { name: 'Wikipedia Uz', url: 'https://uz.wikipedia.org/wiki/Bosh_sahifa', desc: 'Erkin ensiklopediya' },
    { name: 'Google', url: 'https://www.google.com/search?igu=1', desc: 'Qidiruv tizimi' },
    { name: 'GitHub', url: 'https://github.com', desc: 'Dasturchilar ijtimoiy tarmog\'i' },
    { name: 'Daryo.uz', url: 'https://daryo.uz', desc: 'Yangiliklar portali' },
    { name: 'Kun.uz', url: 'https://kun.uz', desc: 'Tezkor xabarlar' },
    { name: 'Wikipedia Eng', url: 'https://en.wikipedia.org', desc: 'English Encyclopedia' }
  ];

  return (
    <div id="browser-module" className="flex h-full flex-col bg-[#fafafb]">
      {/* Browser Navigation and Address Bar */}
      <div className="flex flex-col border-b border-gray-100 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back, Forward, Refresh, Home buttons */}
          <div className="flex gap-1 text-gray-500">
            <button 
              onClick={handleGoBack}
              disabled={historyIndex === 0}
              className={`rounded-lg p-2 transition-all hover:bg-gray-100 ${historyIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-900 active:scale-95'}`}
              title="Orqaga"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              className={`rounded-lg p-2 transition-all hover:bg-gray-100 ${historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-900 active:scale-95'}`}
              title="Oldinga"
            >
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={handleRefresh}
              className="rounded-lg p-2 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
              title="Yangilash"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={handleHome}
              className="rounded-lg p-2 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
              title="Bosh sahifa"
            >
              <Home size={18} />
            </button>
          </div>
          
          {/* URL Input Form */}
          <form onSubmit={handleFormSubmit} className="flex flex-1 items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Veb-sayt URL manzili kiritish yoki qidiruv so'zini yozish..."
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 font-sans font-medium"
            />
            <button type="submit" className="text-gray-400 hover:text-gray-700">
              <Search size={16} />
            </button>
          </form>

          {/* Quick External Access */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100/50 px-4 py-2 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100 active:scale-95 whitespace-nowrap shrink-0"
          >
            Tashqi oynada ochish
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Dynamic warning if some page blocks iframe embedding */}
        {showXFrameWarning && (
          <div className="flex items-start justify-between bg-amber-50/70 border-t border-amber-100/50 px-5 py-2 text-amber-800 text-[11px] font-medium leading-normal animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span>
                Ba'zi saytlar xavfsizlik (CORS/X-Frame) tufayli ichki oynada ko'rsatilmasligi mumkin. Agar ekran oq bo'lib qolsa, o'ng tarafdagi <strong>"Tashqi oynada ochish"</strong> tugmasidan foydalaning.
              </span>
            </div>
            <button 
              onClick={() => setShowXFrameWarning(false)} 
              className="font-bold text-amber-500 hover:text-amber-900 transition-colors ml-4"
            >
              Yopish
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport Grid layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* IFrame Viewport or Custom Cloud Hosting Boshqaruv Paneli */}
        <div className="flex-1 h-full bg-slate-50 relative overflow-y-auto">
          {url === 'https://cloud' ? (
            <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 text-gray-800 font-sans select-none animate-in fade-in duration-300">
              
              {/* Cloud Title Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                    <Server size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cloud Server & Hosting Boshqaruvi</h1>
                    <p className="text-xs text-gray-500 mt-0.5">O'zimizning mustaqil server va konteynerlarni boshqarish tizimi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    serverStatus === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    serverStatus === 'rebooting' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                      serverStatus === 'rebooting' ? 'bg-amber-500 animate-spin' :
                      'bg-blue-500 animate-pulse'
                    }`} />
                    {serverStatus === 'online' ? 'ONLINE (ACTIVE)' :
                     serverStatus === 'rebooting' ? 'REBOOTING...' :
                     'CONFIGURING...'}
                  </span>
                  <button 
                    onClick={handleReboot}
                    disabled={serverStatus !== 'online'}
                    className="flex items-center gap-1.5 p-2 px-3 bg-gray-50 hover:bg-gray-105 rounded-xl border border-gray-100 text-xs font-bold transition-all active:scale-95"
                    title="Konteynerlarni qayta yuklash"
                  >
                    <RefreshCw size={13} className={serverStatus === 'rebooting' ? 'animate-spin' : ''} />
                    Qayta yuklash
                  </button>
                </div>
              </div>

              {/* Stats Widgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* CPU Progress */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">CPU Yuklamasi</span>
                    <Cpu size={16} className="text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">
                      {serverStatus === 'rebooting' ? '0%' : '14.2%'}
                    </span>
                    <span className="text-xs text-emerald-500 font-semibold">Turg'un</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
                      style={{ width: serverStatus === 'rebooting' ? '0%' : '14%' }} 
                    />
                  </div>
                </div>

                {/* RAM Allocation */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Tezkor Xotira (RAM)</span>
                    <HardDrive size={16} className="text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">
                      {serverStatus === 'rebooting' ? '45MB' : '248MB'}
                    </span>
                    <span className="text-xs text-gray-400">/ 1024MB</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-505 h-1.5 rounded-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: serverStatus === 'rebooting' ? '4%' : '24%' }} 
                    />
                  </div>
                </div>

                {/* Network Bandwidth */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Kanal kengligi</span>
                    <Network size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">
                      {serverStatus === 'rebooting' ? '0 Kb/s' : '4.8 Mb/s'}
                    </span>
                    <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 text-emerald-700 rounded-md font-semibold font-mono">1ms latency</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
                      style={{ width: serverStatus === 'rebooting' ? '0%' : '35%' }} 
                    />
                  </div>
                </div>

                {/* Database Connectivity status */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Baza Sinxronizatsiyasi</span>
                    <Database size={16} className="text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">Firebase</span>
                    <span className="text-xs text-emerald-500 font-semibold font-mono">Faol</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                </div>

              </div>

              {/* Main Deployer Section and Service list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Deploy Control Center */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900">Production Build & Pipeline</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Tizimni so'nggi kod o'zgarishlariga ko'ra yangilash va qayta ishga tushirish</p>
                    </div>
                    <button 
                      onClick={handleDeploy}
                      disabled={isDeploying || serverStatus !== 'online'}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                        isDeploying 
                          ? 'bg-blue-100 text-blue-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 active:scale-95'
                      }`}
                    >
                      <Play size={14} fill="currentColor" />
                      {isDeploying ? 'Deploy qilinmoqda...' : 'Yangi buildni joylash'}
                    </button>
                  </div>

                  {/* Code log Console Terminal */}
                  <div className="flex-1 min-h-[220px] bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-slate-300 overflow-y-auto border border-slate-800 flex flex-col gap-1.5 select-text shadow-inner">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <TerminalIcon size={12} className="text-blue-500" />
                      <span>Masofaviy Terminal Chiqishi (Stdout logs)</span>
                    </div>
                    {deployLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`leading-relaxed ${
                          log.includes('SUCCESS') ? 'text-emerald-400 font-extrabold' : 
                          log.includes('[SYSTEM]') ? 'text-amber-400' : 
                          'text-slate-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                    {isDeploying && (
                      <div className="text-blue-400 animate-pulse flex items-center gap-1.5 mt-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        Yuklash jarayoni davom etmoqda...
                      </div>
                    )}
                  </div>
                </div>

                {/* Integration Tools panel */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                      <Lock size={16} className="text-blue-600" />
                      Infratuzilma Ulanishlari
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Soliq va joylashuv tizimi integratsiyalari</p>
                  </div>

                  <div className="space-y-3">
                    {/* Github Connector */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-slate-800">GitHub Repository</span>
                      </div>
                      <button 
                        onClick={() => setConnectedServices(prev => ({...prev, github: !prev.github}))}
                        className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold transition-all ${
                          connectedServices.github 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {connectedServices.github ? "Ulangan" : "Ulash"}
                      </button>
                    </div>

                    {/* Supabase */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-xs text-slate-800">Supabase Database</span>
                      <button 
                        onClick={() => setConnectedServices(prev => ({...prev, supabase: !prev.supabase}))}
                        className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold transition-all ${
                          connectedServices.supabase 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {connectedServices.supabase ? "Ulangan" : "Ulash"}
                      </button>
                    </div>

                    {/* Firebase */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-xs text-slate-800">Firebase Firestore</span>
                      <button 
                        onClick={() => setConnectedServices(prev => ({...prev, firebase: !prev.firebase}))}
                        className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold transition-all ${
                          connectedServices.firebase 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {connectedServices.firebase ? "Ulangan" : "Ulash"}
                      </button>
                    </div>

                    {/* Vercel */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-xs text-slate-800">Vercel Edge API</span>
                      <button 
                        onClick={() => setConnectedServices(prev => ({...prev, vercel: !prev.vercel}))}
                        className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold transition-all ${
                          connectedServices.vercel 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {connectedServices.vercel ? "Ulangan" : "Ulash"}
                      </button>
                    </div>

                    {/* Render */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-xs text-slate-800">Render Container</span>
                      <button 
                        onClick={() => setConnectedServices(prev => ({...prev, render: !prev.render}))}
                        className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold transition-all ${
                          connectedServices.render 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {connectedServices.render ? "Ulangan" : "Ulash"}
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={url}
              title="In-App Web Browser"
              className="w-full h-full border-none shadow-inner animate-in fade-in duration-300"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>

        {/* Sidebar Recommended Links */}
        <div className="w-[280px] bg-white border-l border-gray-100 p-6 overflow-y-auto shrink-0 hidden lg:flex flex-col gap-6">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              Tezkor o'tishlar
            </h3>
            <p className="text-xs text-gray-400">Tavsiya qilingan resurslar</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {popularLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigateTo(link.url)}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                  url === link.url 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-gray-50/30 border-gray-100 hover:border-gray-200 hover:bg-gray-50/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-gray-800">{link.name}</span>
                  <ChevronRight size={13} className="text-gray-300" />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 truncate w-full">{link.desc}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto border-t border-gray-50 pt-5">
            <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-4 font-sans text-[10px] text-gray-500 leading-relaxed space-y-2">
              <p className="font-bold text-gray-700 mb-1">Xavfsiz brauzer</p>
              Ilovadan chiqmasdan xavfsiz va tezkor ravishda har qanday veb sahifani ko'ring va ularning qiyofasini tekshiring.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
