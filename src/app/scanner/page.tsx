'use client'

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    function onScanSuccess(result: string) {
      scanner.clear();
      setScanResult(result);
    }

    function onScanError(error: any) {
      console.warn(error);
    }

    scanner.render(onScanSuccess, onScanError);

    return () => {
        scanner.clear().catch(error => {
            console.error("Failed to clear scanner.", error);
        });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
        <h1 className="text-3xl font-bold mb-2 text-indigo-400">QR Code Scanner</h1>
        <p className="text-gray-400 mb-6">Scan a QR code to connect to the WiFi.</p>
        {scanResult ? (
          <div className="p-4 bg-green-500/20 rounded-lg">
            <p className="font-mono text-green-300 break-all">Success! Data: {scanResult}</p>
          </div>
        ) : (
          <div id="reader" className="w-full"></div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
