import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Download, Image as ImageIcon, Loader2, Sparkles, RefreshCcw } from 'lucide-react';

export default function ImageGenView() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await globalThis.fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json();
      setResult(data.imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-6 lg:p-10 overflow-y-auto scrollbar-hide bg-transparent">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Controls */}
        <div className="space-y-10">
          <header>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Tasvir yarating</h1>
            <p className="text-gray-500">Sun'iy intellekt yordamida hayolotingizdagi tasvirni chizing.</p>
          </header>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Masalan: Futuristik shahar, neon chiroqlar, kiberpank uslubida..."
                className="w-full h-32 glass border-gray-200 rounded-2xl p-4 text-gray-900 outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all">
                  <Sparkles size={16} /> Badiiy uslub
               </button>
               <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all">
                  <RefreshCcw size={16} /> Tasodifiy
               </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {isLoading ? 'Yaratilmoqda...' : 'Yaratish'}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="relative aspect-square w-full bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group w-full h-full"
              >
                <img 
                  src={result} 
                  alt="Generated" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <a 
                    href={result} 
                    download="generated-image.png"
                    className="p-4 rounded-2xl bg-white text-black shadow-2xl hover:scale-110 active:scale-95 transition-all"
                   >
                     <Download size={24} />
                   </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-gray-300"
              >
                {isLoading ? (
                  <div className="relative">
                     <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                     <Loader2 size={64} className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    <ImageIcon size={80} strokeWidth={1} />
                    <p className="text-sm font-medium text-gray-400">Bu yerda sizning tasviringiz paydo bo'ladi</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
