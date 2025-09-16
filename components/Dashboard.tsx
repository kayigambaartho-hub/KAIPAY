import React, { useState, useEffect, useCallback } from 'react';
import type { User, Transaction, CryptoTransaction, CryptoAsset } from '../types';
import { TransactionType, CryptoAsset as CryptoAssetEnum, CryptoTransactionType } from '../types';
import { api } from '../services/api';
import { ArrowUpIcon, ArrowDownIcon, ReceiptIcon, UserIcon, PiggyBankIcon, DollarSignIcon, BitcoinIcon, ShieldCheckIcon, QrCodeIcon, LogoIcon } from './icons';
import SendMoneyModal from './SendMoneyModal';
import BillPayModal from './BillPayModal';
import RequestPaymentModal from './RequestPaymentModal';
import TransactionConfirmationModal from './TransactionConfirmationModal';
import ProfileSettingsModal from './ProfileSettingsModal';
import BiometricPromptModal from './BiometricPromptModal';
import SaveModal from './SaveModal';
import LoanModal from './LoanModal';

declare const QRCode: any;

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onTransaction: (message: string) => void;
  onTransactionError: (message: string) => void;
  updateUser: (user: User) => void;
}

const LARGE_TRANSACTION_THRESHOLD = 1000;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const Header: React.FC<{ user: User; onLogout: () => void; onProfileClick: () => void; }> = ({ user, onLogout, onProfileClick }) => (
  <header className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}!</h1>
      <p className="text-gray-400">Account: {user.accountNumber}</p>
    </div>
    <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
            onClick={onProfileClick}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-full text-gray-300 hover:text-white transition-colors"
            aria-label="Open Profile Settings"
        >
            <UserIcon className="w-6 h-6"/>
        </button>
        <button
            onClick={onLogout}
            className="bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
            Logout
        </button>
    </div>
  </header>
);

const BalanceSummaryCard: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-gray-800 p-6 rounded-2xl mb-8 shadow-lg">
    <p className="text-gray-400 text-sm">Main Wallet Balance</p>
    <p className="text-4xl font-bold text-white mb-4">{formatCurrency(user.balance)}</p>
    <div className="flex justify-between items-center border-t border-gray-700 pt-4">
      <div>
        <p className="text-gray-400 text-sm">Savings</p>
        <p className="text-xl font-semibold text-green-400">{formatCurrency(user.savingsBalance)}</p>
      </div>
      <div className="text-right">
        <p className="text-gray-400 text-sm">Outstanding Loan</p>
        <p className={`text-xl font-semibold ${user.outstandingLoan > 0 ? 'text-yellow-400' : 'text-gray-300'}`}>{formatCurrency(user.outstandingLoan)}</p>
      </div>
    </div>
  </div>
);


const QuickActions: React.FC<{ onSendMoneyClick: () => void; onPayBillClick: () => void; onSaveClick: () => void; onBorrowClick: () => void; }> = ({ onSendMoneyClick, onPayBillClick, onSaveClick, onBorrowClick }) => (
  <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
     <ActionButton onClick={onSendMoneyClick} icon={<ArrowUpIcon className="w-8 h-8" />} label="Send Money" />
     <ActionButton onClick={onPayBillClick} icon={<ReceiptIcon className="w-8 h-8" />} label="Pay a Bill" />
     <ActionButton onClick={onSaveClick} icon={<PiggyBankIcon className="w-8 h-8" />} label="Save Money" />
     <ActionButton onClick={onBorrowClick} icon={<DollarSignIcon className="w-8 h-8" />} label="Borrow" />
  </div>
);

const ActionButton: React.FC<{onClick: () => void; icon: React.ReactNode; label: string}> = ({ onClick, icon, label}) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 bg-gray-700/50 hover:bg-blue-600/50 text-white font-semibold py-4 px-2 rounded-2xl transition-all duration-300 transform hover:scale-105"
    >
      {icon}
      <span className="text-sm text-center">{label}</span>
    </button>
);


const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
  <li className="flex items-center justify-between py-4 border-b border-gray-700">
    <div className="flex items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${transaction.type === TransactionType.CREDIT ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {transaction.type === TransactionType.CREDIT ? <ArrowDownIcon className="text-green-400" /> : <ArrowUpIcon className="text-red-400" />}
      </div>
      <div>
        <p className="font-semibold text-white">{transaction.description}</p>
        <p className="text-sm text-gray-400">{new Date(transaction.date).toLocaleString()}</p>
      </div>
    </div>
    <p className={`font-bold ${transaction.type === TransactionType.CREDIT ? 'text-green-400' : 'text-red-400'}`}>
      {transaction.type === TransactionType.CREDIT ? '+' : '-'}
      {formatCurrency(transaction.amount)}
    </p>
  </li>
);

const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
    {transactions.length > 0 ? (
      <ul>
        {transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
      </ul>
    ) : (
      <p className="text-gray-400 text-center py-4">No transactions yet.</p>
    )}
  </div>
);

const Navigation: React.FC<{ activeView: 'main' | 'crypto'; setActiveView: (view: 'main' | 'crypto') => void; }> = ({ activeView, setActiveView }) => (
    <div className="flex justify-center mb-6">
        <div className="bg-gray-800 p-1.5 rounded-xl flex space-x-2">
            <button onClick={() => setActiveView('main')} className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${activeView === 'main' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                <LogoIcon className="w-5 h-5" /> <span>Mobile Money</span>
            </button>
            <button onClick={() => setActiveView('crypto')} className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${activeView === 'crypto' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                <BitcoinIcon className="w-5 h-5" /> <span>Cryptocurrency</span>
            </button>
        </div>
    </div>
);


// --- START OF CRYPTO COMPONENTS ---

const CryptoKycModal: React.FC<{onClose: () => void; onVerified: (user: User) => void}> = ({ onClose, onVerified }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    // Simulate getting user from context/props
    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const updatedUser = await api.verifyCryptoKyc(userId);
            onVerified(updatedUser);
        } catch (e) {
            // Handle error
        } finally {
            setIsVerifying(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-white mb-2">Identity Verification</h2>
                <p className="text-gray-400 mb-6">To access crypto features, we need to verify your identity. This is for security and regulatory compliance.</p>
                <div className="space-y-4">
                    <input type="text" placeholder="Full Legal Name" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
                    <input type="text" placeholder="Date of Birth (YYYY-MM-DD)" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
                    <div>
                        <label className="text-sm text-gray-300">Upload Government ID (Simulated)</label>
                        <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"/>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Cancel</button>
                    <button onClick={handleVerify} disabled={isVerifying} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800">
                        {isVerifying ? 'Verifying...' : 'Submit for Verification'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MOCK_RECOVERY_PHRASE = "apple banana kiwi grape mango cherry lemon orange pear strawberry pineapple coconut".split(' ');

const CryptoWalletSetupModal: React.FC<{onClose: () => void; onSetup: (user: User) => void}> = ({ onClose, onSetup }) => {
    const [step, setStep] = useState(1);
    const [confirmed, setConfirmed] = useState(false);
    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;

    const handleFinishSetup = async () => {
        const updatedUser = await api.setupCryptoWallet(userId);
        onSetup(updatedUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg m-4">
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Recovery Phrase</h2>
                        <p className="text-gray-400 mb-4">Write down these 12 words in order and keep them somewhere safe. This is the only way to recover your wallet.</p>
                        <div className="grid grid-cols-3 gap-3 bg-gray-900/50 p-4 rounded-lg my-6">
                            {MOCK_RECOVERY_PHRASE.map((word, index) => (
                                <div key={index} className="text-gray-300 font-mono"><span className="text-gray-500 mr-2">{index+1}.</span>{word}</div>
                            ))}
                        </div>
                        <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                            <strong>Warning:</strong> Never share this phrase with anyone. Kaipay will never ask for it.
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setStep(2)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">I've Saved It</button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Backup</h2>
                        <p className="text-gray-400 mb-6">To ensure you saved your phrase correctly, please confirm you understand the importance of your backup.</p>
                        <div className="space-y-4">
                            <label className="flex items-start p-4 bg-gray-700/50 rounded-lg cursor-pointer">
                                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <div className="ml-4">
                                    <span className="font-semibold text-white">I understand that if I lose my recovery phrase, I will lose access to my crypto forever.</span>
                                </div>
                            </label>
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <button onClick={() => setStep(1)} className="text-sm text-blue-400 hover:underline">Back</button>
                            <button onClick={handleFinishSetup} disabled={!confirmed} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed">Finish Setup</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


const CryptoDashboard: React.FC<DashboardProps> = ({ user, updateUser, onTransaction, onTransactionError }) => {
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [isWalletSetupModalOpen, setIsWalletSetupModalOpen] = useState(false);
    const [prices, setPrices] = useState<Record<CryptoAsset, number> | null>(null);
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
    
    const totalPortfolioValue = prices ? Object.values(CryptoAssetEnum).reduce((sum, asset) => {
        return sum + (user.cryptoBalances[asset] * (prices[asset] || 0));
    }, 0) : 0;

    useEffect(() => {
        if (!user.isCryptoKycVerified) {
            setIsKycModalOpen(true);
        } else if (!user.hasCryptoWallet) {
            setIsWalletSetupModalOpen(true);
        } else {
            const fetchCryptoData = async () => {
                try {
                    const [fetchedPrices, fetchedTransactions] = await Promise.all([
                        api.getCryptoPrices(),
                        api.getCryptoTransactions(user.id),
                    ]);
                    setPrices(fetchedPrices);
                    setTransactions(fetchedTransactions);
                } catch (e) {
                    onTransactionError("Failed to load crypto data.");
                }
            };
            fetchCryptoData();
            const interval = setInterval(fetchCryptoData, 10000); // Refresh every 10s
            return () => clearInterval(interval);
        }
    }, [user, onTransactionError]);
    
    if (!user.isCryptoKycVerified) {
        return isKycModalOpen ? <CryptoKycModal onClose={() => setIsKycModalOpen(false)} onVerified={(u) => { updateUser(u); setIsKycModalOpen(false); }} /> : null;
    }
    
    if (!user.hasCryptoWallet) {
        return isWalletSetupModalOpen ? <CryptoWalletSetupModal onClose={() => setIsWalletSetupModalOpen(false)} onSetup={(u) => { updateUser(u); setIsWalletSetupModalOpen(false); }} /> : null;
    }

    return (
        <div>
            {/* Portfolio Summary */}
            <div className="bg-gray-800 p-6 rounded-2xl mb-8 shadow-lg text-center">
                <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                <p className="text-4xl font-bold text-white mb-4">{prices ? formatCurrency(totalPortfolioValue) : 'Loading...'}</p>
            </div>

            {/* Assets List */}
            <div className="bg-gray-800 p-6 rounded-2xl mb-8 shadow-lg">
                 <h2 className="text-xl font-bold text-white mb-4">My Assets</h2>
                 <ul className="divide-y divide-gray-700">
                    {Object.values(CryptoAssetEnum).map(asset => {
                        const balance = user.cryptoBalances[asset];
                        const price = prices?.[asset] || 0;
                        const value = balance * price;
                        return (
                             <li key={asset} className="flex items-center justify-between py-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-4"><BitcoinIcon className="text-yellow-400"/></div>
                                    <div>
                                        <p className="font-bold text-white">{asset}</p>
                                        <p className="text-sm text-gray-400">Price: {formatCurrency(price)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-white">{balance.toFixed(6)} {asset}</p>
                                    <p className="text-sm text-gray-400">{formatCurrency(value)}</p>
                                </div>
                            </li>
                        )
                    })}
                 </ul>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Crypto History</h2>
                {transactions.length > 0 ? (
                    <ul>
                        {transactions.map(tx => (
                            <li key={tx.id} className="flex items-center justify-between py-4 border-b border-gray-700">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${tx.type === 'buy' || tx.type === 'receive' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                        {tx.type === 'buy' || tx.type === 'receive' ? <ArrowDownIcon className="text-green-400" /> : <ArrowUpIcon className="text-red-400" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white capitalize">{tx.type} {tx.asset}</p>
                                        <p className="text-sm text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type === 'buy' || tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}`}>
                                      {tx.type === 'buy' || tx.type === 'receive' ? '+' : '-'}
                                      {tx.cryptoAmount.toFixed(6)} {tx.asset}
                                    </p>
                                    <p className="text-sm text-gray-400">{formatCurrency(tx.usdValue)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-400 text-center py-4">No crypto transactions yet.</p>
                }
            </div>
        </div>
    );
};

// --- END OF CRYPTO COMPONENTS ---

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onTransaction, onTransactionError, updateUser }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{accountNumber: string, amount: number} | null>(null);

  const [isBillPayModalOpen, setIsBillPayModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'main' | 'crypto'>('main');
  
  const fetchTransactions = useCallback(async () => {
    try {
      const userTransactions = await api.getTransactionsForUser(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      onTransactionError("Could not load transaction history.");
    } finally {
        setIsLoading(false);
    }
  }, [user.id, onTransactionError]);
  
  useEffect(() => {
    if (activeView === 'main') {
        fetchTransactions();
    }
  }, [fetchTransactions, activeView]);

  const handleInitiateSend = (accountNumber: string, amount: number) => {
    const isLargeTransaction = amount >= LARGE_TRANSACTION_THRESHOLD;
    setPendingTransaction({ accountNumber, amount });
    setIsSendMoneyModalOpen(false);

    if (user.isBiometricEnabled && isLargeTransaction) {
        setIsBiometricPromptOpen(true);
    } else {
        setIsConfirmModalOpen(true);
    }
  };
  
  const performTransfer = async () => {
    if (!pendingTransaction) return;
    const { accountNumber, amount } = pendingTransaction;
    const result = await api.transferMoney(user.id, accountNumber, amount);
    if (result.success) {
        onTransaction(result.message);
        const updatedUser = { ...user, balance: user.balance - amount };
        updateUser(updatedUser);
        fetchTransactions();
    } else {
        throw new Error(result.message);
    }
  }

  const handleConfirmSend = async (code: string) => {
    try {
        await performTransfer();
        setIsConfirmModalOpen(false);
        setPendingTransaction(null);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred during the transfer.");
    }
  };

  const handleBiometricConfirmSend = async () => {
    try {
        await performTransfer();
    } catch (error: any) {
        onTransactionError(error.message || "An error occurred during transfer.");
    } finally {
        setIsBiometricPromptOpen(false);
        setPendingTransaction(null);
    }
  };
  
  const handlePayBill = async (billerId: string, amount: number, reference: string) => {
    try {
        const result = await api.payBill(user.id, billerId, amount, reference);
        if (result.success) {
            onTransaction(result.message);
            const updatedUser = { ...user, balance: user.balance - amount };
            updateUser(updatedUser);
            fetchTransactions();
        } else {
            onTransactionError(result.message);
        }
    } catch (error: any) {
        onTransactionError(error.message || "An error occurred during the bill payment.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header user={user} onLogout={onLogout} onProfileClick={() => setIsProfileModalOpen(true)} />
        <main>
          <Navigation activeView={activeView} setActiveView={setActiveView} />
          {activeView === 'main' ? (
              <>
                <BalanceSummaryCard user={user} />
                <QuickActions 
                    onSendMoneyClick={() => setIsSendMoneyModalOpen(true)}
                    onPayBillClick={() => setIsBillPayModalOpen(true)}
                    onSaveClick={() => setIsSaveModalOpen(true)}
                    onBorrowClick={() => setIsLoanModalOpen(true)}
                />
                {isLoading ? <p className="text-center text-gray-400">Loading history...</p> : <TransactionHistory transactions={transactions} />}
              </>
          ) : (
             <CryptoDashboard 
                user={user} 
                onLogout={onLogout} 
                onTransaction={onTransaction} 
                onTransactionError={onTransactionError} 
                updateUser={updateUser}
              />
          )}
        </main>
      </div>
      {isSendMoneyModalOpen && (
        <SendMoneyModal
          onClose={() => setIsSendMoneyModalOpen(false)}
          onInitiateSend={handleInitiateSend}
          userBalance={user.balance}
        />
      )}
       {isConfirmModalOpen && pendingTransaction && (
        <TransactionConfirmationModal
            onClose={() => { setIsConfirmModalOpen(false); setPendingTransaction(null); }}
            onConfirm={handleConfirmSend}
            transactionDetails={pendingTransaction}
        />
      )}
       {isBiometricPromptOpen && pendingTransaction && (
        <BiometricPromptModal
            onClose={() => { setIsBiometricPromptOpen(false); setPendingTransaction(null); }}
            onSuccess={handleBiometricConfirmSend}
            title="Confirm High-Value Transaction"
            description={`Authenticate to approve sending ${formatCurrency(pendingTransaction.amount)}.`}
        />
      )}
      {isBillPayModalOpen && (
          <BillPayModal
            onClose={() => setIsBillPayModalOpen(false)}
            onPay={handlePayBill}
            userBalance={user.balance}
           />
      )}
      {isSaveModalOpen && (
        <SaveModal
            user={user}
            onClose={() => setIsSaveModalOpen(false)}
            onUpdateUser={updateUser}
            addNotification={onTransaction}
        />
      )}
      {isLoanModalOpen && (
        <LoanModal
            user={user}
            onClose={() => setIsLoanModalOpen(false)}
            onUpdateUser={updateUser}
            addNotification={onTransaction}
            addNotificationError={onTransactionError}
        />
      )}
       {isProfileModalOpen && (
          <ProfileSettingsModal
            user={user}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateUser={updateUser}
            addNotification={onTransaction}
          />
      )}
    </div>
  );
};

export default Dashboard;
