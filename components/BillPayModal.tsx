import React, { useState, useEffect } from 'react';
import type { Biller } from '../types';
import { api } from '../services/api';

interface BillPayModalProps {
  onClose: () => void;
  onPay: (billerId: string, amount: number, reference: string) => Promise<void>;
  userBalance: number;
}

const BillPayModal: React.FC<BillPayModalProps> = ({ onClose, onPay, userBalance }) => {
  const [billerId, setBillerId] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [billers, setBillers] = useState<Biller[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBillers = async () => {
      const availableBillers = await api.getBillers();
      setBillers(availableBillers);
      if (availableBillers.length > 0) {
        setBillerId(availableBillers[0].id);
      }
    };
    fetchBillers();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numericAmount = parseFloat(amount);
    
    if (!billerId) {
      setError('Please select a biller.');
      return;
    }
    if (!reference.trim()) {
        setError('Please enter a reference or account number.');
        return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericAmount > userBalance) {
      setError('Insufficient balance.');
      return;
    }
    
    setIsProcessing(true);
    try {
        await onPay(billerId, numericAmount, reference);
        onClose();
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Pay a Bill</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handlePay}>
          <div className="mb-4">
            <label htmlFor="biller" className="block text-sm font-medium text-gray-300 mb-2">Biller</label>
            <select
              id="biller"
              value={billerId}
              onChange={(e) => setBillerId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {billers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="reference" className="block text-sm font-medium text-gray-300 mb-2">Reference / Account No.</label>
            <input
              type="text"
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., your account number"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
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
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
              {isProcessing ? 'Processing...' : 'Pay Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPayModal;
