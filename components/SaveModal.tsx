import React, { useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface SaveModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  addNotification: (message: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const SaveModal: React.FC<SaveModalProps> = ({ user, onClose, onUpdateUser, addNotification }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'save' | 'withdraw'>('save');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    setIsProcessing(true);
    try {
        let updatedUser;
        if (mode === 'save') {
            if (numericAmount > user.balance) {
              throw new Error('Insufficient main balance.');
            }
            updatedUser = await api.moveToSavings(user.id, numericAmount);
            addNotification(`Successfully saved ${formatCurrency(numericAmount)}.`);
        } else { // withdraw
            if (numericAmount > user.savingsBalance) {
                throw new Error('Insufficient savings balance.');
            }
            updatedUser = await api.withdrawFromSavings(user.id, numericAmount);
            addNotification(`Successfully withdrew ${formatCurrency(numericAmount)}.`);
        }
        onUpdateUser(updatedUser);
        onClose();
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsProcessing(false);
    }
  };

  const maxAmount = mode === 'save' ? user.balance : user.savingsBalance;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Save & Withdraw</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="mb-6">
            <div className="flex p-1 bg-gray-700 rounded-lg">
                <button 
                    onClick={() => { setMode('save'); setAmount(''); setError('')}}
                    className={`w-1/2 py-2 text-center rounded-md transition-colors ${mode === 'save' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300'}`}
                >
                    Save
                </button>
                 <button 
                    onClick={() => { setMode('withdraw'); setAmount(''); setError('')}}
                    className={`w-1/2 py-2 text-center rounded-md transition-colors ${mode === 'withdraw' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300'}`}
                >
                    Withdraw
                </button>
            </div>
        </div>
        
        <div className="text-center mb-4 bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">
                {mode === 'save' ? 'Main Balance' : 'Savings Balance'}
            </p>
            <p className="text-lg font-bold text-white">{formatCurrency(maxAmount)}</p>
        </div>

        <form onSubmit={handleAction}>
          <div className="mb-4">
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
                 <button type="button" onClick={() => setAmount(maxAmount.toString())} className="absolute inset-y-0 right-0 px-4 text-blue-400 text-sm font-semibold">MAX</button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed capitalize">
              {isProcessing ? 'Processing...' : mode}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
