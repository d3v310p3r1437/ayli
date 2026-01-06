'use client';

import { useState } from 'react';

const plans = [
  { id: '30M', duration: '30 минут', price: '1000₮', color: { text: 'text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20', hoverBorder: 'hover:border-cyan-400' } },
  { id: '1H', duration: '1 цаг', price: '2000₮', color: { text: 'text-blue-400', border: 'border-blue-500', shadow: 'shadow-blue-500/20', hoverBorder: 'hover:border-blue-400' } },
  { id: '3H', duration: '3 цаг', price: '3000₮', color: { text: 'text-indigo-400', border: 'border-indigo-500', shadow: 'shadow-indigo-500/20', hoverBorder: 'hover:border-indigo-400' } },
  { id: '5H', duration: '5 цаг', price: '4000₮', color: { text: 'text-purple-400', border: 'border-purple-500', shadow: 'shadow-purple-500/20', hoverBorder: 'hover:border-purple-400' } },
  { id: '10H', duration: '10 цаг', price: '8000₮', color: { text: 'text-pink-400', border: 'border-pink-500', shadow: 'shadow-pink-500/20', hoverBorder: 'hover:border-pink-400' } },
  { id: '15H', duration: '15 цаг', price: '11000₮', color: { text: 'text-rose-400', border: 'border-rose-500', shadow: 'shadow-rose-500/20', hoverBorder: 'hover:border-rose-400' } },
];

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
    <main className='flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8'>
      <div className='w-full max-w-4xl'>
        <h1 className='text-4xl md:text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600'>
          Wi-Fi-аа сонгоно уу
        </h1>
        <p className='text-center text-gray-400 mb-10'>Хүссэн багцаа сонгоод интернэтэд холбогдоорой.</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-gray-800 rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 ${
                selectedPlan === plan.id
                  ? `${plan.color.border} ${plan.color.shadow}`
                  : `border-gray-700 ${plan.color.hoverBorder}`
              }`}>
              <h2 className='text-2xl font-semibold mb-2'>{plan.duration}</h2>
              <p className={`text-4xl font-bold ${plan.color.text}`}>{plan.price}</p>
            </div>
          ))}

          {/* Custom Hour Card */}
          <div
            onClick={() => setSelectedPlan('custom')}
            className={`bg-gray-800 rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 lg:col-span-3 ${
              selectedPlan === 'custom'
                ? 'border-green-500 shadow-lg shadow-green-500/20'
                : 'border-gray-700 hover:border-green-400'
            }`}>
            <h2 className='text-2xl font-semibold mb-4'>Эсвэл өөрөө сонгох</h2>
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <input
                type="number"
                value={customHours}
                onChange={handleCustomHourChange}
                className='bg-gray-700 border-2 border-gray-600 rounded-lg p-3 w-full sm:w-32 text-center text-2xl font-bold focus:outline-none focus:border-green-500'
                min="1"
              />
              <div className='flex items-baseline'>
                <p className='text-4xl font-bold text-green-400'>{customPrice.toLocaleString()}₮</p>
                <span className='text-gray-400 ml-2'>/ {customHours} цаг</span>
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
