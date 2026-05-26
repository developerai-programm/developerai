import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Download, Image as ImageIcon, Loader2, Sparkles, RefreshCcw } from 'lucide-react';

export default function ImageGenView() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const UzbekSamples = [
    "Sokin tog' yonbag'ri, oltin soat quyosh nurlari, tiniq alpine ko'li va uning aks ettirishi, fotorealistik",
    "Futuristik Toshkent 3050-yil, baland osmono'par uylar, uchib yuruvchi mashinalar va milliy naqshlar, kiberpank",
    "Yoqimtoy 3D robot o'g'il bola ilmiy kitob o'qimoqda, Studio yoritgichlari, pastel ranglar, Blender 3D render",
    "Afsonaviy sehrli o'rmon, yorug'lik tarqatuvchi miltillovchi qo'ziqorinlar, tumanli sirli daryo, akvarel uslubida",
    "Minimalist chiziqlar bilan chizilgan chiroyli ayol portreti va gullar, chiziqli san'at (Line Art), estetik oq-qora fon",
    "Retro-futuristik kiber kosmik kema kokpiti, neon boshqaruv panellari va oynadan ko'rinib turgan ulkan galaktika"
  ];

  const UzbekStyles = [
    ", yuqori sifatli photorealistic render",
    ", shirin 3D animatsion multfilm uslubi",
    ", kiberpank yorqin neon uslubi",
    ", klassik moybo'yoqli (oil painting) san'at asari",
    ", minimalist chiziqli rasm (vector line art)",
    ", fentezi uslubidagi raqamli illyustratsiya"
  ];

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * UzbekSamples.length);
    setPrompt(UzbekSamples[randomIndex]);
    setError(null);
  };

  const handleAddStyle = () => {
    if (!prompt.trim()) {
      setPrompt("Chiroyli tabiat va futuristik shahar manzarasi" + UzbekStyles[Math.floor(Math.random() * UzbekStyles.length)]);
    } else {
      const randomStyle = UzbekStyles[Math.floor(Math.random() * UzbekStyles.length)];
      // Prevent duplicating style suffix if already partially there
      if (!prompt.includes(randomStyle.slice(0, 8))) {
        setPrompt(prev => prev.trim() + randomStyle);
      }
    }
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await globalThis.fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Rasm generatsiyasida xatolik yuz berdi.");
      }
      setResult(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ulanish xatoligi. Server javob bermayapti.");
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
               <button 
                 type="button"
                 onClick={handleAddStyle}
                 className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
               >
                  <Sparkles size={16} /> Badiiy uslub
               </button>
               <button 
                 type="button"
                 onClick={handleRandomPrompt}
                 className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
               >
                  <RefreshCcw size={16} /> Tasodifiy
               </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

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
