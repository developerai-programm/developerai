import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight, Globe } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

export default function PricingView() {
  const [isAnnual, setIsAnnual] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const processPayment = async (method: 'checkout' | 'ton') => {
    if (method === 'ton') {
      let amount = "1835496054";
      if (selectedPlan) {
        if (selectedPlan.name === 'Pro') {
          amount = isAnnual ? '19272708569' : '1835496054';
        } else if (selectedPlan.name === 'Enterprise') {
          amount = isAnnual ? '19272708569' : '2753244081';
        }
      }
      window.location.href = `ton://transfer/UQC4o86OTxG3dgST9Mzgy2sdhG4zovI-ynqkpqhtrIOj2kp3?amount=${amount}`;
      setShowPaymentModal(false);
      return;
    }

    try {
      const response = await globalThis.fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: selectedPlan.name,
          isAnnual: isAnnual,
          userId: 'user_id' // In real app, get from auth state
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

  const plans = [
    {
      name: 'Boshlang\'ich',
      price: 0,
      unit: 'UZS',
      description: 'AI imkoniyatlari bilan tanishish uchun.',
      icon: Star,
      color: 'blue',
      features: ['Kuniga 10 ta xabar', 'Standart model', 'Rasm tahlili (cheklangan)', 'Jamiyat yordami'],
    },
    {
      name: 'Pro',
      price: isAnnual ? 419990 : 39990,
      unit: 'UZS',
      description: 'Professional foydalanuvchilar va ijodkorlar uchun.',
      icon: Zap,
      color: 'purple',
      featured: true,
      features: [
        'Cheksiz xabarlar',
        'Llama 3.3 70B & GPT OSS',
        'Professional rasm yasash',
        'Kod tahlili va tahrirlash',
        'Maxsus yordam 24/7'
      ],
    },
    {
      name: 'Enterprise',
      price: isAnnual ? 639990 : 59990,
      unit: 'UZS',
      description: 'Katta jamoalar va tashkilotlar uchun.',
      icon: Crown,
      color: 'orange',
      features: [
        'Barcha Pro imkoniyatlari',
        'Shaxsiy AI modelini o\'rgatish',
        'API orqali ulanish',
        'Ma\'lumotlar xavfsizligi kafolati',
        'Shaxsiy menejer'
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-hide p-6 lg:p-12">
      <div className="max-w-6xl mx-auto w-full space-y-16 py-10">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-600 border border-blue-100"
          >
            <Zap size={14} className="fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider">Tarifingizni yangilang</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 tracking-tight">
            Nega <span className="text-blue-600">DEVELOPER AI</span>?
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Professional dasturchilar uchun mukammal AI vositalari. Checkout.uz orqali xavfsiz va tezkor to'lovlar.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Oylik</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-7 w-12 rounded-full bg-gray-200 transition-colors focus:outline-none"
            >
              <motion.div
                animate={{ x: isAnnual ? 22 : 2 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Yillik <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md">-30% gacha</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative flex flex-col p-8 rounded-[32px] border transition-all duration-300",
                plan.featured 
                  ? "bg-white border-blue-200 shadow-2xl scale-105 z-10" 
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
              )}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  Tavsiya etiladi
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center",
                  plan.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  plan.color === 'purple' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                )}>
                  <plan.icon size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-gray-900">
                      <NumberFlow value={plan.price} />
                    </span>
                    <span className="text-lg font-bold text-gray-900">UZS</span>
                  </div>
                  <span className="text-gray-400 font-medium text-sm">/{isAnnual ? 'yil' : 'oy'}</span>
                </div>

                <div className="space-y-4 pt-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

                  <div className="pt-10">
                    <button 
                      onClick={() => handleUpgrade(plan)}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group",
                        plan.featured 
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" 
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                      )}
                    >
                      Boshlash
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
              {showPaymentModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                  />
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto"
                    >
                      <div className="p-8 space-y-6">
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-bold text-gray-900">To'lov usuli</h2>
                          <p className="text-gray-500 text-sm">
                            {selectedPlan?.name} tarifi uchun to'lov usulini tanlang
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => processPayment('checkout')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Globe size={24} />
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-gray-900">Checkout.uz</p>
                                <p className="text-xs text-gray-400">Humo, UzCard orqali</p>
                              </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </button>

                          <button
                            onClick={() => processPayment('ton')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                                <Zap size={24} />
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-gray-900">TON Wallet</p>
                                <p className="text-xs text-gray-400">Telegram/TON orqali</p>
                              </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        </div>

                        <button 
                          onClick={() => setShowPaymentModal(false)}
                          className="w-full py-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>

        {/* Footer info */}
        <div className="text-center pb-20">
           <p className="text-gray-400 text-sm">
             Qo'shimcha savollar bormi? <a href="#" className="text-blue-600 font-semibold hover:underline">Biz bilan bog'laning</a>
           </p>
        </div>
      </div>
    </div>
  );
}
