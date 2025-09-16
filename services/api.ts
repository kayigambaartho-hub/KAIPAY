import { USERS, TRANSACTIONS, BILLERS, LOANS, CRYPTO_TRANSACTIONS, CRYPTO_PRICES } from '../data/mock';
// FIX: Moved CryptoAsset from a type-only import to a value import, as it's an enum used at runtime.
import type { User, Transaction, Biller, Loan, CryptoTransaction } from '../types';
import { TransactionType, LoanTransactionType, CryptoTransactionType, CryptoAsset } from '../types';

let users: User[] = [...USERS];
let transactions: Transaction[] = [...TRANSACTIONS];
let loans: Loan[] = [...LOANS];
let cryptoTransactions: CryptoTransaction[] = [...CRYPTO_TRANSACTIONS];


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Helper Functions ---
const findUserById = (id: string) => users.find(u => u.id === id);
const findUserIndexById = (id: string) => users.findIndex(u => u.id === id);

const calculateLoanLimit = (user: User, userTransactions: Transaction[]): number => {
  // Simple credit scoring: 50% of balance + 20% of total deposits in history, capped at $2000
  const totalDeposits = userTransactions
    .filter(t => t.type === TransactionType.CREDIT)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const limit = user.balance * 0.5 + totalDeposits * 0.2;
  return Math.min(Math.floor(limit), 2000);
};


export const api = {
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    await simulateDelay(500);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserByAccountNumber: async (accountNumber: string): Promise<User | undefined> => {
    await simulateDelay(300);
    return users.find(u => u.accountNumber === accountNumber);
  },

  registerUser: async (name: string, email: string, passwordHash: string): Promise<User> => {
    await simulateDelay(800);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists.");
    }
    const newAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      passwordHash,
      accountNumber: newAccountNumber,
      balance: 500, // Starting bonus
      isBiometricEnabled: false,
      savingsBalance: 0,
      loanLimit: 100, // Start with a small limit
      outstandingLoan: 0,
      isCryptoKycVerified: false,
      hasCryptoWallet: false,
      cryptoBalances: { BTC: 0, ETH: 0, USDT: 0 },
    };
    users.push(newUser);
    return newUser;
  },
  
  getTransactionsForUser: async (userId: string): Promise<Transaction[]> => {
    await simulateDelay(400);
    const userTransactions = transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Recalculate loan limit when transactions are fetched
    const userIndex = findUserIndexById(userId);
    if(userIndex !== -1) {
      const user = users[userIndex];
      users[userIndex].loanLimit = calculateLoanLimit(user, userTransactions);
    }
    
    return userTransactions;
  },

  transferMoney: async (senderId: string, recipientAccountNumber: string, amount: number): Promise<{ success: boolean; message: string }> => {
    await simulateDelay(1200);

    const sender = findUserById(senderId);
    if (!sender) {
      return { success: false, message: 'Sender not found.' };
    }
    
    if (sender.balance < amount) {
      return { success: false, message: 'Insufficient funds.' };
    }
    
    const recipient = users.find(u => u.accountNumber === recipientAccountNumber);
    if (!recipient) {
      return { success: false, message: 'Recipient account number not found.' };
    }

    if (sender.id === recipient.id) {
        return { success: false, message: "You cannot send money to yourself."};
    }

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;

    // Create transaction records
    const now = new Date().toISOString();
    const senderTransaction: Transaction = {
      id: `txn_${Date.now()}_d`,
      userId: sender.id,
      type: TransactionType.DEBIT,
      amount,
      description: `Sent to ${recipient.name}`,
      date: now,
      counterparty: {
        name: recipient.name,
        accountNumber: recipient.accountNumber,
      },
    };
    const recipientTransaction: Transaction = {
      id: `txn_${Date.now()}_c`,
      userId: recipient.id,
      type: TransactionType.CREDIT,
      amount,
      description: `Received from ${sender.name}`,
      date: now,
      counterparty: {
        name: sender.name,
        accountNumber: sender.accountNumber,
      },
    };

    transactions.push(senderTransaction, recipientTransaction);

    return { success: true, message: `Successfully sent $${amount.toFixed(2)} to ${recipient.name}.` };
  },

  getBillers: async (): Promise<Biller[]> => {
    await simulateDelay(200);
    return BILLERS;
  },

  payBill: async (userId: string, billerId: string, amount: number, reference: string): Promise<{ success: boolean; message: string }> => {
    await simulateDelay(1000);
    const user = findUserById(userId);
    if (!user) {
        return { success: false, message: 'User not found.' };
    }
    if (user.balance < amount) {
        return { success: false, message: 'Insufficient funds.' };
    }
    const biller = BILLERS.find(b => b.id === billerId);
    if (!biller) {
        return { success: false, message: 'Biller not found.' };
    }

    user.balance -= amount;

    const billPaymentTransaction: Transaction = {
        id: `txn_${Date.now()}_bill`,
        userId: user.id,
        type: TransactionType.DEBIT,
        amount,
        description: `Bill Payment: ${biller.name}`,
        date: new Date().toISOString(),
        counterparty: {
            name: biller.name,
            accountNumber: reference,
        },
    };
    transactions.push(billPaymentTransaction);
    return { success: true, message: `Successfully paid $${amount.toFixed(2)} to ${biller.name}.` };
  },

  updateBiometricSetting: async (userId: string, isEnabled: boolean): Promise<User> => {
    await simulateDelay(400);
    const userIndex = findUserIndexById(userId);
    if (userIndex === -1) {
        throw new Error("User not found.");
    }
    users[userIndex] = { ...users[userIndex], isBiometricEnabled: isEnabled };
    return users[userIndex];
  },

  // --- Savings API ---
  moveToSavings: async (userId: string, amount: number): Promise<User> => {
      await simulateDelay(600);
      const userIndex = findUserIndexById(userId);
      if (userIndex === -1) throw new Error("User not found.");

      const user = users[userIndex];
      if (user.balance < amount) throw new Error("Insufficient main balance.");

      users[userIndex].balance -= amount;
      users[userIndex].savingsBalance += amount;
      return users[userIndex];
  },

  withdrawFromSavings: async (userId: string, amount: number): Promise<User> => {
      await simulateDelay(600);
      const userIndex = findUserIndexById(userId);
      if (userIndex === -1) throw new Error("User not found.");

      const user = users[userIndex];
      if (user.savingsBalance < amount) throw new Error("Insufficient savings balance.");
      
      users[userIndex].savingsBalance -= amount;
      users[userIndex].balance += amount;
      return users[userIndex];
  },

  // --- Loans API ---
  requestLoan: async (userId: string, amount: number): Promise<User> => {
      await simulateDelay(1000);
      const userIndex = findUserIndexById(userId);
      if (userIndex === -1) throw new Error("User not found.");

      const user = users[userIndex];
      const availableCredit = user.loanLimit - user.outstandingLoan;
      if (amount > availableCredit) throw new Error("Requested amount exceeds available credit.");

      users[userIndex].balance += amount;
      users[userIndex].outstandingLoan += amount;
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      users[userIndex].loanDueDate = dueDate.toISOString();

      const loanRecord: Loan = {
          id: `loan_${Date.now()}`,
          userId,
          type: LoanTransactionType.DISBURSEMENT,
          amount,
          date: new Date().toISOString(),
      };
      loans.push(loanRecord);

      return users[userIndex];
  },
  
  repayLoan: async (userId: string, amount: number): Promise<User> => {
      await simulateDelay(900);
      const userIndex = findUserIndexById(userId);
      if (userIndex === -1) throw new Error("User not found.");

      const user = users[userIndex];
      if (user.balance < amount) throw new Error("Insufficient balance for repayment.");
      if (amount > user.outstandingLoan) throw new Error("Repayment amount exceeds outstanding loan.");

      users[userIndex].balance -= amount;
      users[userIndex].outstandingLoan -= amount;
      if(users[userIndex].outstandingLoan === 0) {
          users[userIndex].loanDueDate = undefined;
      }
      
      const loanRecord: Loan = {
          id: `loan_${Date.now()}`,
          userId,
          type: LoanTransactionType.REPAYMENT,
          amount,
          date: new Date().toISOString(),
      };
      loans.push(loanRecord);

      return users[userIndex];
  },
  
  getLoanHistory: async (userId: string): Promise<Loan[]> => {
      await simulateDelay(300);
      return loans
          .filter(l => l.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // --- Crypto API ---
    verifyCryptoKyc: async (userId: string): Promise<User> => {
        await simulateDelay(1500);
        const userIndex = findUserIndexById(userId);
        if (userIndex === -1) throw new Error("User not found.");
        users[userIndex].isCryptoKycVerified = true;
        return users[userIndex];
    },

    setupCryptoWallet: async (userId: string): Promise<User> => {
        await simulateDelay(500);
        const userIndex = findUserIndexById(userId);
        if (userIndex === -1) throw new Error("User not found.");
        users[userIndex].hasCryptoWallet = true;
        return users[userIndex];
    },
    
    getCryptoPrices: async (): Promise<Record<CryptoAsset, number>> => {
        await simulateDelay(100);
        // Simulate slight price fluctuation
        return {
            [CryptoAsset.BTC]: CRYPTO_PRICES.BTC + (Math.random() - 0.5) * 100,
            [CryptoAsset.ETH]: CRYPTO_PRICES.ETH + (Math.random() - 0.5) * 10,
            [CryptoAsset.USDT]: 1.00 + (Math.random() - 0.5) * 0.001,
        };
    },

    getCryptoTransactions: async (userId: string): Promise<CryptoTransaction[]> => {
        await simulateDelay(300);
        return cryptoTransactions
            .filter(tx => tx.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    buyCrypto: async (userId: string, asset: CryptoAsset, usdAmount: number): Promise<{ user: User, transaction: CryptoTransaction }> => {
        await simulateDelay(1200);
        const userIndex = findUserIndexById(userId);
        if (userIndex === -1) throw new Error("User not found.");
        const user = users[userIndex];
        if (user.balance < usdAmount) throw new Error("Insufficient balance.");

        const price = CRYPTO_PRICES[asset];
        const cryptoAmount = usdAmount / price;
        
        users[userIndex].balance -= usdAmount;
        users[userIndex].cryptoBalances[asset] += cryptoAmount;
        
        const newTx: CryptoTransaction = {
            id: `ctx_${Date.now()}`,
            userId,
            asset,
            type: CryptoTransactionType.BUY,
            cryptoAmount,
            usdValue: usdAmount,
            date: new Date().toISOString(),
        };
        cryptoTransactions.push(newTx);
        
        return { user: users[userIndex], transaction: newTx };
    },

    sellCrypto: async (userId: string, asset: CryptoAsset, cryptoAmount: number): Promise<{ user: User, transaction: CryptoTransaction }> => {
        await simulateDelay(1200);
        const userIndex = findUserIndexById(userId);
        if (userIndex === -1) throw new Error("User not found.");
        const user = users[userIndex];

        if (user.cryptoBalances[asset] < cryptoAmount) throw new Error(`Insufficient ${asset} balance.`);
        
        const price = CRYPTO_PRICES[asset];
        const usdAmount = cryptoAmount * price;

        users[userIndex].cryptoBalances[asset] -= cryptoAmount;
        users[userIndex].balance += usdAmount;

        const newTx: CryptoTransaction = {
            id: `ctx_${Date.now()}`,
            userId,
            asset,
            type: CryptoTransactionType.SELL,
            cryptoAmount,
            usdValue: usdAmount,
            date: new Date().toISOString(),
        };
        cryptoTransactions.push(newTx);
        
        return { user: users[userIndex], transaction: newTx };
    },

    sendCrypto: async (userId: string, asset: CryptoAsset, cryptoAmount: number, recipientAddress: string): Promise<{ user: User, transaction: CryptoTransaction }> => {
        await simulateDelay(1500);
        const userIndex = findUserIndexById(userId);
        if (userIndex === -1) throw new Error("User not found.");
        const user = users[userIndex];

        if (user.cryptoBalances[asset] < cryptoAmount) throw new Error(`Insufficient ${asset} balance.`);
        
        const price = CRYPTO_PRICES[asset];
        const usdAmount = cryptoAmount * price;

        users[userIndex].cryptoBalances[asset] -= cryptoAmount;

        const newTx: CryptoTransaction = {
            id: `ctx_${Date.now()}`,
            userId,
            asset,
            type: CryptoTransactionType.SEND,
            cryptoAmount,
            usdValue: usdAmount,
            date: new Date().toISOString(),
            counterparty: recipientAddress,
        };
        cryptoTransactions.push(newTx);
        
        return { user: users[userIndex], transaction: newTx };
    }
};