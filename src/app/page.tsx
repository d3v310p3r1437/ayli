'use client'

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// A more visually appealing checkmark icon for the success message
const CheckmarkIcon = () => (
    <svg className="w-12 h-12 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        qrbox: {
          width: 280, // Slightly larger for better visibility
          height: 280,
        },
        fps: 10, // Higher FPS for smoother scanning
      },
      false // verbose output
    );

    const onScanSuccess = (result: string) => {
      scanner.clear().catch(err => console.error("Scanner clear failed", err));
      setScanResult(result);
    };

    const onScanError = (error: any) => {
      // This can be noisy, so we'll keep it minimal.
      // console.warn(`QR scan error: ${error}`);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      // Ensure scanner is cleared on component unmount
      if (scanner && scanner.getState()) {
        scanner.clear().catch(err => console.error("Cleanup scanner failed", err));
      }
    };
  }, [scanResult]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg mx-auto bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-500/30 overflow-hidden transform transition-all duration-500 hover:scale-105">
        <div className="p-8 text-center">
          
          {scanResult ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <CheckmarkIcon />
              <h2 className="text-3xl font-extrabold mt-4 text-green-300">Scan Successful!</h2>
              <p className="text-gray-300 mt-2 mb-6">Your QR code data is ready.</p>
              <div className="w-full p-4 bg-gray-900/50 rounded-lg text-left">
                <p className="font-mono text-lg text-green-400 break-all">{scanResult}</p>
              </div>
              <button onClick={() => setScanResult(null)} className="mt-8 px-6 py-3 bg-indigo-600 rounded-full text-lg font-semibold hover:bg-indigo-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
                Scan Again
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">WiFi QR Scanner</h1>
              <p className="text-gray-300 mb-8">Point your camera at a QR code to connect.</p>
              <div id="reader" className="w-full rounded-2xl overflow-hidden border-4 border-indigo-500/50 shadow-inner bg-gray-900/30"></div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ScannerPage;
