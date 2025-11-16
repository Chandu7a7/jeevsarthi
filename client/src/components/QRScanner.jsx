import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    if (isOpen && !html5QrCodeRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      // Check camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop()); // Stop immediately, Html5Qrcode will handle it
        setCameraPermission('granted');
      } catch (permError) {
        setCameraPermission('denied');
        setError('Camera permission denied. Please enable camera access.');
        setScanning(false);
        return;
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      // Start scanning
      await html5QrCode.start(
        {
          facingMode: 'environment', // Use back camera on mobile
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback (ignore, it's just scanning)
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = (decodedText) => {
    stopScanning();
    if (onScan) {
      onScan(decodedText);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    stopScanning();
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              Camera permission is required to scan QR codes.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setCameraPermission(null);
                startScanning();
              }}
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="relative">
          <div
            id="qr-reader"
            ref={scannerRef}
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          ></div>

          {scanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-primary-green rounded-lg" style={{ width: '250px', height: '250px' }}>
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-green"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-green"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-green"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-green"></div>
              </div>
            </div>
          )}

          {!scanning && !error && cameraPermission !== 'denied' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Point your camera at the QR code
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          {!scanning && (
            <Button
              className="flex-1"
              onClick={startScanning}
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRScanner;

