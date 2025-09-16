import React, { useState, useEffect } from 'react';
import type { User, Loan } from '../types';
import { LoanTransactionType } from '../types';
import { api } from '../services/api';
import { ArrowUpIcon, ArrowDownIcon } from './icons';

interface LoanModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  addNotification: (message: string) => void;
  addNotificationError: (message: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

const LoanModal: React.FC<LoanModalProps> = ({ user, onClose, onUpdateUser, addNotification, addNotificationError }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'request' | 'repay'>('request');
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const history = await api.getLoanHistory(user.id);
            setLoanHistory(history);
        } catch (e) {
            addNotificationError("Could not load loan history.");
        } finally {
            setIsLoadingHistory(false);
        }
    };
    fetchHistory();
  }, [user.id, addNotificationError]);
  
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
        if (mode === 'request') {
            updatedUser = await api.requestLoan(user.id, numericAmount);
            addNotification(`Successfully borrowed ${formatCurrency(numericAmount)}.`);
        } else { // repay
            updatedUser = await api.repayLoan(user.id, numericAmount);
            addNotification(`Successfully repaid ${formatCurrency(numericAmount)}.`);
        }
        onUpdateUser(updatedUser);
        onClose();
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsProcessing(false);
    }
  };

  const availableCredit = user.loanLimit - user.outstandingLoan;
  const maxAmount = mode === 'request' ? availableCredit : Math.min(user.outstandingLoan, user.balance);

  const LoanHistoryItem: React.FC<{ item: Loan }> = ({ item }) => (
      <li className="flex items-center justify-between py-3">
          <div className="flex items-center">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${item.type === LoanTransactionType.DISBURSEMENT ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                  {item.type === LoanTransactionType.DISBURSEMENT ? <ArrowDownIcon className="text-blue-400 w-5 h-5" /> : <ArrowUpIcon className="text-green-400 w-5 h-5" />}
              </div>
              <div>
                  <p className="font-semibold text-white capitalize">{item.type}</p>
                  <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
              </div>
          </div>
           <p className={`font-semibold ${item.type === LoanTransactionType.DISBURSEMENT ? 'text-blue-400' : 'text-green-400'}`}>
              {formatCurrency(item.amount)}
           </p>
      </li>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Loan Center</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Actions */}
            <div>
                <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-400">Available Credit</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(availableCredit)}</p>
                    <p className="text-xs text-gray-500">Total Limit: {formatCurrency(user.loanLimit)}</p>
                </div>
                 <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Outstanding Loan</p>
                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(user.outstandingLoan)}</p>
                    <p className="text-xs text-gray-500">Due Date: {formatDate(user.loanDueDate)}</p>
                </div>

                <div className="mt-6">
                    <div className="flex p-1 bg-gray-700 rounded-lg mb-4">
                        <button onClick={() => { setMode('request'); setAmount(''); setError('')}} className={`w-1/2 py-2 text-center rounded-md transition-colors ${mode === 'request' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300'}`}>Request</button>
                        <button onClick={() => { setMode('repay'); setAmount(''); setError('')}} className={`w-1/2 py-2 text-center rounded-md transition-colors ${mode === 'repay' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300'}`}>Repay</button>
                    </div>
                     <form onSubmit={handleAction}>
                        <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                            <input type="number" id="loan_amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="0.00" step="0.01" min="0.01" required
                            />
                            <button type="button" onClick={() => setAmount(maxAmount.toString())} className="absolute inset-y-0 right-0 px-3 text-blue-400 text-sm font-semibold">MAX</button>
                        </div>
                         {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                        <button type="submit" disabled={isProcessing} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 capitalize">
                           {isProcessing ? 'Processing...' : `Confirm ${mode}`}
                        </button>
                     </form>
                </div>
            </div>

            {/* Right Column: History */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Loan History</h3>
                {isLoadingHistory ? <p className="text-gray-400">Loading...</p> : 
                    loanHistory.length > 0 ? (
                        <ul className="divide-y divide-gray-600/50 max-h-80 overflow-y-auto pr-2">
                           {loanHistory.map(item => <LoanHistoryItem key={item.id} item={item} />)}
                        </ul>
                    ) : <p className="text-gray-400 text-center pt-8">No loan history.</p>
                }
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoanModal;
