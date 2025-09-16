import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheckIcon } from './icons';

interface TransactionConfirmationModalProps {
    onClose: () => void;
    onConfirm: (code: string) => Promise<void>;
    transactionDetails: {
        accountNumber: string;
        amount: number;
    }
}

const CORRECT_CODE = "654321"; // Dummy code for simulation

const TransactionConfirmationModal: React.FC<TransactionConfirmationModalProps> = ({ onClose, onConfirm, transactionDetails }) => {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const enteredCode = code.join('');

        if (enteredCode.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }
        
        if (enteredCode !== CORRECT_CODE) {
            setError('Invalid confirmation code.');
            setCode(new Array(6).fill(''));
            inputsRef.current[0]?.focus();
            return;
        }
        
        setIsConfirming(true);
        try {
            await onConfirm(enteredCode);
            // Parent handles closing on success
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsConfirming(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-blue-500/20 rounded-full mb-4">
                        <ShieldCheckIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Confirm Transaction</h2>
                    <p className="text-gray-400 mt-2 mb-6">
                        Please enter the 6-digit code from your authenticator app to confirm this transaction.
                        <br/> (Hint: it's {CORRECT_CODE})
                    </p>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4 w-full mb-6">
                        <div className="flex justify-between items-center text-left">
                            <div>
                                <p className="text-sm text-gray-400">You are sending</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(transactionDetails.amount)}</p>
                            </div>
                             <div>
                                <p className="text-sm text-gray-400 text-right">To Account</p>
                                <p className="text-lg font-mono text-gray-300">{transactionDetails.accountNumber}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputsRef.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    aria-label={`Digit ${index + 1}`}
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-400 text-center text-sm mb-4 h-5">{error}</p>}
                        <div className="flex items-center space-x-4 mt-6">
                             <button type="button" onClick={onClose} className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                             <button type="submit" disabled={isConfirming} className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                                {isConfirming ? 'Confirming...' : 'Confirm & Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionConfirmationModal;
