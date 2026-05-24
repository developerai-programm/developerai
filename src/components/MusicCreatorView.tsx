import React, { useState } from 'react';
import { Music, Sparkles, Wand2, RefreshCw, Layers, AudioLines, Heart } from 'lucide-react';
import MusicPlayer, { Track } from './MusicPlayer';

export const DEFAULT_TRACKS: Track[] = [
  {
    title: "Lo-Fi Focus Beat",
    artist: "Aesthetic Chill Generator",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Synthwave Dreamscape",
    artist: "Cyber Sunrise",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Acoustic Raindrops",
    artist: "Ambient Nature Loop",
    cover: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicCreatorView() {
  const [prompt, setPrompt] = useState('Yalpiz gullari va kechki yomg\'ir ohangidagi sokin Lo-Fi musiqa...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [showPlayer, setShowPlayer] = useState(true);
  const [idCode, setIdCode] = useState(() => 'MSC-' + Math.floor(100000 + Math.random() * 900000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerationStep('Tizim audio elementlarining spektrlarini dasturiy tarzda tahlil qilmoqda...');

    const steps = [
      'Garmonik tovush to\'lqinlari va bas elementlari sintezlanmoqda...',
      'Baraban va lofi perkubator guruhlari tuzilmoqda...',
      'Musiqa to\'liqligicha yig\'ildi, muqova va sarlavha biriktirilmoqda...',
      'YOSHLASH MUVAFFARIYATLI YAKUNLANDI!'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setGenerationStep(steps[current]);
        current++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        const nextId = 'MSC-' + Math.floor(100000 + Math.random() * 900000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        setIdCode(nextId);
        const newTrack: Track = {
          title: prompt.length > 22 ? prompt.slice(0, 22) + "..." : prompt,
          artist: "Sizning AI Ijodingiz",
          cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
          src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        };
        setGeneratedTracks([newTrack, ...DEFAULT_TRACKS]);
        setShowPlayer(true);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:p-12 space-y-8 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-indigo-500/10 shadow-lg">
            <Music size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">AI Musiqa Yaratuvchi</h1>
            <p className="text-xs text-gray-400 mt-1">Garmonik neyron tarmoqlari vositasida matndan to'liq musiqa kuylarini generatsiya qiling</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100/50 rounded-full text-xs font-bold text-purple-700">
            <Sparkles size={13} className="animate-spin text-purple-500" />
            AI Synthesizer v2.4
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        
        {/* Creation parameters panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Wand2 size={16} className="text-purple-500" />
              Matn so'mzasini kiriting (Musical Prompt)
            </h3>

            <div className="space-y-2">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Musiqa asosi, ritm va mood haqida batafsil yozing..."
                rows={3}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium resize-none shadow-inner"
              />
              <p className="text-[10px] text-gray-400 font-medium">Uzbek, ingliz yoki boshqa tillardagi prompts qo'llab-quvvatlanadi.</p>
            </div>

            {/* Quick Presets selection */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-bold text-gray-600">Tezkor andozalar (Templates):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Chill Jazz Piano with vinyl crackles",
                  "80s Synthwave neon highway drive",
                  "Cyberpunk heavy industrial action synth",
                  "Ambient meditation rain sounds with soft harp"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPrompt(preset)}
                    className="text-[10px] font-semibold py-1.5 px-3.5 bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <AudioLines size={15} className="text-purple-400" />
                <span>Format: Ultra HQ MP3 (320kbps)</span>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`flex items-center gap-2 py-3 px-6 rounded-2xl text-xs font-black tracking-wide transition-all ${
                  isGenerating 
                    ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/10 active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Generatsiya qilinmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} fill="currentColor" />
                    Musiqani Yaratish
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generatsiya Log panel */}
          {isGenerating && (
            <div className="p-5 bg-purple-50/40 border-l-4 border-purple-500 rounded-2xl flex items-start gap-4 animate-pulse">
              <div className="p-2 bg-purple-500 text-white rounded-xl">
                <RefreshCw size={16} className="animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-purple-950">AI sintez jarayoni faol</p>
                <p className="text-[11px] font-mono text-purple-700">{generationStep}</p>
              </div>
            </div>
          )}

          {/* Guidelines info */}
          <div className="bg-slate-50 border border-gray-100 rounded-3xl p-5 text-gray-500 space-y-2 text-xs leading-relaxed">
            <h4 className="font-bold text-gray-700">Musiqa yaratish bo'yicha tavsiyalar</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-[11px] font-medium">
              <div className="space-y-1">
                <p className="text-purple-600 font-bold">1. Janr va Mood</p>
                <p className="text-gray-400">Rasmga muvofiq (misol uchun lo-fi, chill, dark, energic) ko'rinishda batafsil yozing.</p>
              </div>
              <div className="space-y-1">
                <p className="text-purple-600 font-bold">2. Ovoz asboblari</p>
                <p className="text-gray-400">Pianino, elektro-gitara, garmon, synth elementlarini qo'shing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Retro Vinyl Player Container */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-50/30 rounded-3xl border border-gray-100 p-6 shadow-inner relative min-h-[460px]">
          {showPlayer ? (
            <div className="space-y-5 flex flex-col items-center justify-center w-full">
              <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                <AudioLines size={14} className="text-purple-500 animate-pulse" />
                Yaratilgan audio fayli
              </p>
              <MusicPlayer tracks={generatedTracks} />
              
              <div className="flex items-center gap-2 select-text text-[10px] font-bold text-gray-400 bg-white px-3.5 py-1.5 rounded-full border border-gray-100 shadow-sm mt-3">
                <span className="text-purple-600 font-extrabold uppercase">ID CODE:</span>
                <span className="font-mono text-purple-950 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100/40">{idCode}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
              <div className="w-14 h-14 bg-gray-100 border border-gray-200/50 rounded-2xl flex items-center justify-center">
                <Music size={24} className="text-gray-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Hozircha musiqa yo'q</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Matndan musiqa yaratish tugmasini bosib o'zingizning ilk ijodingizni boshlang.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
