'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wifi, CheckCircle, XCircle, Copy, Check, Clock } from 'lucide-react';

const HOURLY_RATE = 500; // 1 цагийн үнэ

const durationOptions = [
  { value: 0.5, label: '30 минут' },
  { value: 1, label: '1 цаг' },
  { value: 2, label: '2 цаг' },
  { value: 3, label: '3 цаг' },
  { value: 5, label: '5 цаг' },
  { value: 8, label: '8 цаг' },
  { value: 10, label: '10 цаг' },
  { value: 15, label: '15 цаг' },
  { value: 24, label: '24 цаг' },
];

function AccessForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const finalDuration = useMemo(() => {
    if (isCustomActive) {
      const customValue = parseFloat(customDuration);
      return isNaN(customValue) || customValue <= 0 ? null : customValue;
    }
    return selectedDuration;
  }, [isCustomActive, customDuration, selectedDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalDuration) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/create-wifi-token`;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      if (!supabaseUrl || !anonKey) {
        throw new Error("Supabase тохиргоо олдсонгүй.");
      }
      if (!code) {
        throw new Error("QR код уншигдсангүй. Дахин уншуулна уу.")
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ code_id: code, duration_hours: finalDuration }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Нэвтрэх эрх үүсгэхэд алдаа гарлаа.');
      }

      setResult(responseData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const CredentialCard = ({ label, value }) => {
      const [copied, setCopied] = useState(false);
      const copyToClipboard = () => {
          navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          });
      }
      
      return (
        <div className="w-full text-left">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <div className="relative mt-1">
                <p className="text-lg font-mono bg-gray-900/70 p-4 rounded-lg break-all pr-12">{value}</p>
                <button onClick={copyToClipboard} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {copied ? 
                        <Check className="w-6 h-6 text-green-400" /> : 
                        <Copy className="w-6 h-6" />}
                </button>
            </div>
        </div>
      )
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-cyan-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg mx-auto bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl shadow-cyan-500/30 overflow-hidden">
        <div className="p-8 text-center">
          
          {!result && !error && (
            <form onSubmit={handleSubmit}>
              <Wifi className="w-12 h-12 mx-auto text-cyan-400" />
              <h1 className="text-4xl font-extrabold mt-4 mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">WiFi-д Холбогдох</h1>
              <p className="mb-8 text-gray-300">Таны нэвтрэх код: <span className='font-mono bg-gray-700/80 px-2 py-1 rounded-md text-cyan-300'>{code || "Код олдсонгүй"}</span></p>

              <div className="mb-8 text-left">
                <label className="block mb-3 text-lg font-medium text-gray-200">Хугацаагаа сонгоно уу</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { setSelectedDuration(option.value); setIsCustomActive(false); }}
                      className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 flex flex-col items-center justify-center ${!isCustomActive && selectedDuration === option.value ? 'bg-cyan-500 text-white shadow-lg scale-105' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'}`}>
                      <span className="text-lg">{option.label}</span>
                      <span className="text-xs mt-1 font-mono">{option.value * HOURLY_RATE}₮</span>
                    </button>
                  ))}
                   <div onClick={() => { setIsCustomActive(true); setSelectedDuration(null); }} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${isCustomActive ? 'bg-cyan-500 text-white shadow-lg scale-105' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'}`}>
                        <span className="text-lg">Өөр</span>
                         {isCustomActive ? (
                            <input 
                                type="number" 
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                placeholder="Цаг"
                                autoFocus
                                className="w-16 text-center bg-cyan-600/50 text-white rounded-md mt-1 outline-none font-mono placeholder-cyan-200"
                            />
                        ) : (
                            <Clock className="w-5 h-5 mt-1" />
                        )}
                    </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !code || !finalDuration}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? 'Үүсгэж байна...' : 'Баталгаажуулах'}
              </button>
            </form>
          )}
          
          {error && (
              <div className='py-10 flex flex-col items-center justify-center'>
                <XCircle className="w-16 h-16 mx-auto text-red-400"/>
                <h2 className="text-3xl font-extrabold mt-4 text-red-400">Алдаа Гарлаа</h2>
                <p className="text-gray-300 mt-2 mb-6 max-w-sm text-center">{error}</p>
                <button onClick={() => window.location.href='/'} className="mt-4 px-8 py-3 bg-red-600 rounded-full text-lg font-semibold hover:bg-red-500 transition-colors shadow-lg">
                    Буцах
                </button>
            </div>
          )}

          {result && (
            <div className='py-10'>
              <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
              <h2 className="text-3xl font-extrabold mt-4 text-green-300">Амжилттай!</h2>
              <p className="mb-8 text-gray-300">Доорх мэдээллийг ашиглан WiFi сүлжээнд холбогдоно уу.</p>
              <div className="space-y-6">
                <CredentialCard label="Сүлжээний нэр (SSID)" value={result.ssid} />
                <CredentialCard label="Нууц үг" value={result.password} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


export default function AccessFormPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-cyan-900 text-white flex items-center justify-center p-4 font-sans">
                <div className="text-2xl font-bold text-cyan-300">Ачааллаж байна...</div>
            </div>
        }>
            <AccessForm />
        </Suspense>
    )
}
