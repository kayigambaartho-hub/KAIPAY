import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

declare const QRCode: any; // Using the global QRCode from the script tag

interface RequestPaymentModalProps {
  onClose: () => void;
  user: User;
}

const RequestPaymentModal: React.FC<RequestPaymentModalProps> = ({ onClose, user }) => {
  const [amount, setAmount] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = useCallback(async () => {
      setError('');
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid amount.');
        setQrCodeDataUrl('');
        return;
      }
      setIsLoading(true);
      const paymentData = JSON.stringify({
          accountNumber: user.accountNumber,
          name: user.name,
          amount: numericAmount
      });
      try {
          const dataUrl = await QRCode.toDataURL(paymentData, { width: 256, margin: 2 });
          setQrCodeDataUrl(dataUrl);
      } catch (err) {
          console.error(err);
          setError('Failed to generate QR code.');
      } finally {
          setIsLoading(false);
      }
  }, [amount, user]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100 text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Request a Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        {!qrCodeDataUrl ? (
          <div>
            <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount to Request</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">$</span>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                    />
                </div>
            </div>
            {error && <p className="text-red-400 text-sm my-4">{error}</p>}
            <button onClick={generateQRCode} disabled={isLoading} className="w-full mt-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800">
                {isLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        ) : (
            <div className="flex flex-col items-center">
                <p className="text-gray-300 mb-2">Scan this code to pay</p>
                <p className="text-3xl font-bold text-white mb-4">${parseFloat(amount).toFixed(2)}</p>
                <div className="p-4 bg-white rounded-lg">
                    <img src={qrCodeDataUrl} alt="Payment QR Code" />
                </div>
                <button onClick={() => setQrCodeDataUrl('')} className="w-full mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
                    Request another amount
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RequestPaymentModal;
