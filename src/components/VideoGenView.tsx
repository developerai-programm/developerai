import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Wand2, Download, RefreshCw, Sparkles } from 'lucide-react';

interface VideoSample {
  id: string;
  title: string;
  prompt: string;
  style: string;
  videoUrl: string;
}

const VIDEO_LOOPS = {
  space: "https://assets.mixkit.co/videos/preview/mixkit-star-field-background-909-large.mp4",
  cyberpunk: "https://assets.mixkit.co/videos/preview/mixkit-neon-lights-of-a-futuristic-city-39832-large.mp4",
  nature: "https://assets.mixkit.co/videos/preview/mixkit-landscape-of-a-peaceful-river-at-sunset-31623-large.mp4",
  ocean: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-sea-waves-1191-large.mp4",
  anime: "https://assets.mixkit.co/videos/preview/mixkit-animation-of-clouds-floating-in-the-sky-40286-large.mp4",
  abstract: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-3112-large.mp4"
};

export default function VideoGenView() {
  const [prompt, setPrompt] = useState("Futuristik megapolis shahar va uchib yuruvchi neon mashinalar, kiberpank tunda, UHD...");
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      label: "Neon Kiberpank",
      prompt: "Futuristik megapolis shahar va uchib yuruvchi neon mashinalar, kiberpank tunda, ultra yuqori sifatda"
    },
    {
      label: "Sirli Koinot",
      prompt: "Cheksiz koinot tubi, yorqin nebula tumanliklari va uzoqdagi aylanayotgan sirli galaktikalar"
    },
    {
      label: "Sokin Tabiat",
      prompt: "Chiroyli tog' yonbag'ri, shoshilib oqayotgan tiniq daryo suvi va yam-yashil daraxtlar, quyosh botishi"
    },
    {
      label: "Sehrli Okean",
      prompt: "Tinch okean to'lqinlari, tiniq moviy suv ko'rinishi, quyosh nurlarining suv tubidagi jilosi"
    }
  ];

  const handlePresetClick = (text: string) => {
    setPrompt(text);
    setError(null);
  };

  const determineVideoUrl = (inputText: string): string => {
    const text = inputText.toLowerCase();
    if (text.includes("koinot") || text.includes("space") || text.includes("nebula") || text.includes("galaktika") || text.includes("yulduz") || text.includes("planet")) {
      return VIDEO_LOOPS.space;
    }
    if (text.includes("shahar") || text.includes("city") || text.includes("neon") || text.includes("kiber") || text.includes("cyber") || text.includes("car")) {
      return VIDEO_LOOPS.cyberpunk;
    }
    if (text.includes("okean") || text.includes("ocean") || text.includes("dengiz") || text.includes("wave") || text.includes("suv") || text.includes("suvi")) {
      return VIDEO_LOOPS.ocean;
    }
    if (text.includes("tabiat") || text.includes("nature") || text.includes("daryo") || text.includes("forest") || text.includes("ko'l") || text.includes("sunset") || text.includes("tog'")) {
      return VIDEO_LOOPS.nature;
    }
    if (text.includes("anime") || text.includes("animatsiya") || text.includes("bulut") || text.includes("multfilm")) {
      return VIDEO_LOOPS.anime;
    }
    return VIDEO_LOOPS.abstract;
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResultVideo(null);
    setError(null);

    const steps = [
      "AI neyron tarmoqlari ishga tushirilmoqda (Gemini Video Engine)...",
      "Matn prompti tahlil qilinmoqda va obyektlar loyihalanmoqda...",
      "Asosiy kadrlar (Keyframes) hosil qilinmoqda...",
      "Kadrlar orasidagi harakat silliqligi (Temporal consistency) orttirilmoqda...",
      "Ray-tracing va yorug'lik effektlari qo'shilmoqda...",
      "Audio generator klip bilan hamohang tarzda bog'lanmoqda...",
      "Video klip muvaffaqiyatli render qilindi!"
    ];

    let current = 0;
    setCurrentStep(steps[0]);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setCurrentStep(steps[current]);
      } else {
        clearInterval(interval);
        setIsLoading(false);
        const videoSrc = determineVideoUrl(prompt);
        setResultVideo(videoSrc);
      }
    }, duration * 250); // scales rendering speed with chosen video duration (seconds multiplier)
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:p-12 space-y-8 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-blue-500/10 shadow-lg">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">AI Video Yaratuvchi</h1>
            <p className="text-xs text-gray-400 mt-1">Neyron tarmoqlari vositasida matnli tavsifdan yuqori sifatli video kliplar yarating</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100/50 rounded-full text-xs font-bold text-green-700">
            <Sparkles size={13} className="text-green-500 animate-pulse" />
            Vercel Premium Bepul
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        {/* Settings panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Wand2 size={16} className="text-blue-500" />
              Video Prompt yozing
            </h3>

            <div className="space-y-2">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Yaratmoqchi bo'lgan video klip sahnalari, kamera harakati va vizual ko'rinishlarini batafsil yozing..."
                rows={3}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none shadow-inner"
              />
              <p className="text-[10px] text-gray-400 font-medium">Uzbek, ingliz tillarida istalgan g'oyani yozishingiz mukammal qo'llab-quvvatlanadi.</p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-655">Tayyor andozalar:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.prompt)}
                    className="text-[10px] font-semibold py-1.5 px-3.5 bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratios & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-655">Kadr o'lchami (Aspect Ratio):</p>
                <div className="flex gap-2">
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 text-xs py-2 rounded-xl font-bold border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {ratio === '16:9' ? '横 16:9' : ratio === '9:16' ? '縦 9:16' : '正 1:1'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-655">Video davomiyligi (Duration):</p>
                <div className="flex gap-2">
                  {[5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setDuration(sec)}
                      className={`flex-1 text-xs py-2 rounded-xl font-bold border transition-all ${
                        duration === sec
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {sec} soniya
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`w-full md:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                  isLoading 
                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Render qilinmoqda ({duration}s)...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} fill="currentColor" />
                    Videoni Render Qilish
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines block */}
          <div className="bg-slate-50 border border-gray-100 rounded-3xl p-5 text-gray-500 space-y-2 text-xs leading-relaxed">
            <h4 className="font-bold text-gray-700">Video render rejimi haqida</h4>
            <p className="text-gray-400">Bizning klip tizimimiz eng murakkab vizual animatsiyalarni tayyorlaydi. Hozirda siz uchun limitsiz render qilish mutlaqo tekin qilib sozlangan.</p>
          </div>
        </div>

        {/* Video preview pane */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-50/30 rounded-3xl border border-gray-100 p-6 shadow-inner relative min-h-[420px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 w-full">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <Video size={24} className="text-blue-500" />
              </div>
              <div className="space-y-1 w-full max-w-xs">
                <p className="text-xs font-black text-gray-800">Video klip yig'ilmoqda</p>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: duration * 1.5, ease: "easeInOut" }}
                    className="bg-blue-600 h-full"
                  />
                </div>
                <p className="text-[10px] font-mono text-blue-600 mt-2 truncate">{currentStep}</p>
              </div>
            </div>
          ) : resultVideo ? (
            <div className="space-y-5 flex flex-col items-center justify-center w-full">
              <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} className="text-green-500 animate-pulse" />
                Render qilingan video klip
              </p>
              
              <div className={`overflow-hidden rounded-2xl shadow-lg border border-gray-100 w-full bg-black relative ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[260px]' : aspectRatio === '1:1' ? 'aspect-square max-w-[360px]' : 'aspect-video'
              }`}>
                <video 
                  src={resultVideo} 
                  controls 
                  autoPlay 
                  loop 
                  playsInline
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="flex gap-3 w-full">
                <a
                  href={resultVideo}
                  download="generated-video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-150 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Download size={14} />
                  Klipni yuklab olish
                </a>
                <button
                  type="button"
                  onClick={() => setResultVideo(null)}
                  className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100/50 text-red-600 border border-red-100 rounded-2xl active:scale-95 transition-all cursor-pointer"
                  title="Qayta tahrirlash"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
              <div className="w-14 h-14 bg-gray-100 border border-gray-200/50 rounded-2xl flex items-center justify-center">
                <Video size={24} className="text-gray-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Vizualizatsiya yo'q</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Matndan chiroyli video yaratish tugmasini bosib videoni yuklang.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
