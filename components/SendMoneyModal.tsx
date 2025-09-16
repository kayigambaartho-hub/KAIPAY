import React, { useState } from 'react';

interface SendMoneyModalProps {
  onClose: () => void;
  onInitiateSend: (accountNumber: string, amount: number) => void;
  userBalance: number;
}

const LARGE_TRANSACTION_THRESHOLD = 1000;

const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ onClose, onInitiateSend, userBalance }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const numericAmount = parseFloat(amount);
  const isLargeTransaction = numericAmount > LARGE_TRANSACTION_THRESHOLD;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{10}$/.test(accountNumber)) {
      setError('Account number must be 10 digits.');
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
    onInitiateSend(accountNumber, numericAmount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Send Money</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handleContinue}>
          <div className="mb-4">
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-2">Recipient's Account Number</label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="10-digit account number"
              required
            />
          </div>
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
            </div>
          </div>

          {isLargeTransaction && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 text-sm rounded-lg p-3 my-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div><strong>Warning:</strong> This is a large transaction. Please review the details carefully before proceeding.</div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
              {isProcessing ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMoneyModal;