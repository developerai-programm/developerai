import { useState } from 'react';
import { Globe, Search, ArrowLeft, ArrowRight, RotateCcw, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { SearchSource } from '../types';

export default function Browser() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: SearchSource[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setResult(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div id="browser-module" className="flex h-full flex-col bg-gray-50">
      {/* Browser Bar */}
      <div className="flex items-center gap-4 bg-white px-6 py-3 shadow-sm">
        <div className="flex gap-2 text-gray-400">
          <button className="rounded-lg p-2 hover:bg-gray-100 hover:text-gray-600"><ArrowLeft size={18} /></button>
          <button className="rounded-lg p-2 hover:bg-gray-100 hover:text-gray-600"><ArrowRight size={18} /></button>
          <button className="rounded-lg p-2 hover:bg-gray-100 hover:text-gray-600"><RotateCcw size={18} /></button>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
          <ShieldCheck size={16} className="text-green-600" />
          <span className="text-xs font-medium text-gray-400">https://</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Webdan qidirish yoki URL manzili..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {isSearching ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> : <Search size={16} className="text-gray-400" />}
        </form>

        <button className="rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">Yangi oyna</button>
      </div>

      {/* Viewport */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          {!result && !isSearching && (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl">
                 <Globe size={48} className="text-blue-600" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">Xavfsiz Web Izlash</h1>
              <p className="max-w-md text-gray-500">Gemini sun'iy intellekti yordamida eng so'nggi ma'lumotlarni qidiring va oling.</p>
              
              <div className="mt-12 grid grid-cols-2 gap-4 text-left">
                {["Eng so'nggi yangiliklar", "Ob-havo ma'lumoti", "Valyuta kurslari", "Texnologiyalar"].map(t => (
                  <button key={t} onClick={() => {setQuery(t)}} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm hover:shadow-md">
                    <span className="text-sm font-medium">{t}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="space-y-6 pt-10">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-200" />
              <div className="space-y-3">
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-5/6 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">AI Xulosasi</h2>
                <div className="prose prose-blue text-[15px] leading-relaxed text-gray-700">
                  {result.text}
                </div>
              </div>

              {result.sources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Manbalar</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {result.sources.map((source, idx) => (
                      source.web && (
                        <a 
                          key={idx}
                          href={source.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
                        >
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="truncate text-sm font-bold text-blue-600">{source.web.title}</span>
                            <span className="truncate text-xs text-gray-400">{source.web.uri}</span>
                          </div>
                          <ExternalLink size={16} className="text-gray-300" />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
