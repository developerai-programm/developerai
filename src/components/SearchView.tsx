import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ExternalLink, Loader2, List, Grid, ShieldCheck, ChevronRight } from 'lucide-react';

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await globalThis.fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Search Header */}
      <div className="w-full flex justify-center py-10 px-6 shrink-0">
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-4xl glass border-gray-200 rounded-full flex items-center p-2 pl-6 gap-4 shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10 transition-all bg-white"
        >
          <Globe size={20} className="text-blue-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Internetdan izlash..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 text-lg placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-10">
          {!result && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
              {[
                { label: 'Eng so\'nggi sun\'iy intellekt yangiliklari', icon: ShieldCheck },
                { label: 'Ob-havo ma\'lumoti (Toshkent)', icon: Globe },
                { label: 'Valyuta kurslari bugungi kunda', icon: List },
                { label: 'Texnologiya sohasidagi trenlar', icon: Grid }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setQuery(item.label); }}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5 text-left hover:bg-gray-50 hover:border-blue-200 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                     <item.icon className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
                     <span className="text-gray-700 font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-100 group-hover:text-blue-200 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="space-y-6 pt-10">
               <div className="h-8 w-1/3 bg-gray-100 animate-pulse rounded-lg" />
               <div className="space-y-2">
                 <div className="h-4 w-full bg-gray-100 animate-pulse rounded-lg" />
                 <div className="h-4 w-full bg-gray-100 animate-pulse rounded-lg" />
                 <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded-lg" />
               </div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-[32px] p-8 lg:p-12 space-y-8 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Groq Compound tomonidan tahlil qilindi</h2>
                </div>
                <button className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:underline">
                  <ExternalLink size={14} /> Manbalarni ko'rish
                </button>
              </div>

              <div className="prose prose-blue max-w-none text-gray-700 leading-[1.8] text-[16px]">
                  {result.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
