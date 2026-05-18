import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, RefreshCw, Wand2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setResultImage(null);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResultImage(data.imageUrl);
    } catch (error) {
      console.error("Image Gen Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const aspectRatios = [
    { id: '1:1', label: 'Square' },
    { id: '16:9', label: 'Landscape' },
    { id: '9:16', label: 'Portrait' },
    { id: '4:3', label: 'Classic' },
  ];

  return (
    <div id="image-gen-module" className="flex h-full flex-col bg-white">
      <header className="flex h-16 items-center border-b border-gray-100 px-8">
        <div className="flex items-center gap-3">
          <ImageIcon size={20} className="text-blue-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Image Generation</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Controls */}
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Tasavvur qiling...</label>
                <textarea
                  id="image-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Masalan: Futuristik shahar, kiberpank uslubida, neon chiroqlar bilan..."
                  className="h-32 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Tomonlar nisbati</label>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                        aspectRatio === ratio.id 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ratio.label} ({ratio.id})
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="generate-button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-black disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} />}
                {isGenerating ? "Yaratilmoqda..." : "Tasvirni yaratish"}
              </button>
            </div>

            {/* Preview */}
            <div className="relative flex min-h-[400px] flex-col overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 bg-opacity-50">
              <AnimatePresence mode="wait">
                {resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="group relative h-full w-full"
                  >
                    <img 
                      src={resultImage} 
                      alt={prompt} 
                      className="h-full w-full object-contain p-4"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <a 
                        href={resultImage} 
                        download="chatgrap-image.png"
                        className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-gray-900 shadow-xl hover:scale-105"
                      >
                        <Download size={20} />
                        Yuklab olish
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full w-full flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-gray-300 shadow-sm">
                      <Sparkles size={40} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">Tayyormisiz?</h3>
                    <p className="text-sm text-gray-500">Promt kiriting va sun'iy intellekt siz uchun tasvir yaratsin.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isGenerating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  </div>
                  <p className="font-bold text-blue-600">Tasvir yaratilmoqda...</p>
                  <p className="mt-1 text-sm text-gray-400">O'rtacha 10-15 soniya vaqt oladi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
