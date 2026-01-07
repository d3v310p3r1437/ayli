'use client';

import { useState } from 'react';
import Image from 'next/image';

const plans = [
  { id: '30M', duration: '30 минут', price: '1000₮', color: { text: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-500', shadow: 'shadow-cyan-500/30', hover: 'hover:shadow-cyan-500/30' } },
  { id: '1H', duration: '1 цаг', price: '2000₮', color: { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500', shadow: 'shadow-blue-500/30', hover: 'hover:shadow-blue-500/30' } },
  { id: '3H', duration: '3 цаг', price: '3000₮', color: { text: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-500', shadow: 'shadow-indigo-500/30', hover: 'hover:shadow-indigo-500/30' } },
  { id: '5H', duration: '5 цаг', price: '4000₮', color: { text: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-500', shadow: 'shadow-purple-500/30', hover: 'hover:shadow-purple-500/30' } },
  { id: '10H', duration: '10 цаг', price: '8000₮', color: { text: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-500', shadow: 'shadow-pink-500/30', hover: 'hover:shadow-pink-500/30' } },
  { id: '15H', duration: '15 цаг', price: '11000₮', color: { text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-500', shadow: 'shadow-rose-500/30', hover: 'hover:shadow-rose-500/30' } },
];

const customPlanColor = { text: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500', shadow: 'shadow-green-500/30', hover: 'hover:shadow-green-500/30' };

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(1000); // Default price for 1 hour

  const pay = async (planId: string) => {
    try {
      let requestBody;

      if (planId === 'custom') {
        requestBody = { 
          plan_id: 'custom',
          hours: customHours,
          mac: 'AUTO_DETECT_LATER' 
        };
      } else {
        requestBody = { 
          plan_id: planId, 
          mac: 'AUTO_DETECT_LATER' 
        };
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create_order`;
      console.log('Requesting URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorResponse = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorResponse.error || `Сервертэй холбогдоход алдаа гарлаа (HTTP ${res.status})`);
      }

      const data = await res.json();

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        throw new Error('Төлбөрийн URL олдсонгүй.');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert(`Төлбөр амжилтгүй боллоо: ${error.message}`);
    }
  };

  const handleCustomHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value, 10);
    if (!isNaN(hours) && hours > 0) {
      setCustomHours(hours);
      // Pricing logic: 1000₮ per hour
      setCustomPrice(hours * 1000);
      setSelectedPlan('custom');
    } else {
      setCustomHours(0);
      setCustomPrice(0);
      setSelectedPlan(null);
    }
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 md:p-8'>
      <div className='w-full max-w-4xl'>
        <div className="flex flex-row items-center justify-center mb-2">
            <Image 
                src="/ayli-logo.png" 
                alt="Ayli Logo" 
                width={220} 
                height={220} 
                className="drop-shadow-[0_4px_15px_rgba(192,132,252,0.4)] mr-6"
            />
            <h1 className='text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500'>
              Интернет аялал
            </h1>
        </div>
        <p className='text-center text-slate-500 mb-10'>Хүссэн багцаа сонгоод интернэтэд холбогдоорой.</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 ${plan.color.bg} ${
                selectedPlan === plan.id
                  ? `ring-2 ${plan.color.border} shadow-lg ${plan.color.shadow}`
                  : `border-transparent hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg ${plan.color.hover}`
              }`}>
              <h2 className='text-2xl font-semibold mb-2 text-slate-700'>{plan.duration}</h2>
              <p className={`text-4xl font-bold ${plan.color.text}`}>{plan.price}</p>
            </div>
          ))}

          {/* Custom Hour Card */}
          <div
            onClick={() => setSelectedPlan('custom')}
            className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 lg:col-span-3 ${customPlanColor.bg} ${
              selectedPlan === 'custom'
                ? `ring-2 ${customPlanColor.border} shadow-lg ${customPlanColor.shadow}`
                : `border-transparent hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg ${customPlanColor.hover}`
            }`}>
            <h2 className='text-2xl font-semibold mb-4 text-slate-700'>Эсвэл өөрөө сонгох</h2>
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <input
                type="number"
                value={customHours}
                onChange={handleCustomHourChange}
                className={`bg-white border-2 rounded-lg p-3 w-full sm:w-32 text-center text-2xl font-bold focus:outline-none focus:ring-2 ${selectedPlan === 'custom' ? `${customPlanColor.border} ${customPlanColor.text}` : 'border-slate-300 text-slate-800 focus:border-green-500'}`}
                min="1"
              />
              <div className='flex items-baseline'>
                <p className={`text-4xl font-bold ${customPlanColor.text}`}>{customPrice.toLocaleString()}₮</p>
                <span className='text-slate-500 ml-2'>/ {customHours} цаг</span>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <button
            onClick={() => pay(selectedPlan!)}
            disabled={!selectedPlan}
            className='bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl py-4 px-12 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/30 disabled:shadow-none'
          >
            Баталгаажуулах
          </button>
        </div>
      </div>
    </main>
  );
}
