import type { User, Transaction, Biller, Loan, CryptoTransaction } from '../types';
import { TransactionType, LoanTransactionType, CryptoAsset, CryptoTransactionType } from '../types';

export const USERS: User[] = [
  {
    id: 'user_1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    passwordHash: 'password123',
    accountNumber: '1234567890',
    balance: 5210.50,
    isBiometricEnabled: true,
    savingsBalance: 12500.00,
    loanLimit: 1500,
    outstandingLoan: 250,
    loanDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isCryptoKycVerified: true,
    hasCryptoWallet: true,
    cryptoBalances: {
        [CryptoAsset.BTC]: 0.05,
        [CryptoAsset.ETH]: 1.5,
        [CryptoAsset.USDT]: 2500.00,
    },
  },
  {
    id: 'user_2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    passwordHash: 'password123',
    accountNumber: '0987654321',
    balance: 1750.00,
    isBiometricEnabled: false,
    savingsBalance: 200.00,
    loanLimit: 500,
    outstandingLoan: 0,
    isCryptoKycVerified: false,
    hasCryptoWallet: false,
    cryptoBalances: {
        [CryptoAsset.BTC]: 0,
        [CryptoAsset.ETH]: 0,
        [CryptoAsset.USDT]: 0,
    },
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_1',
    userId: 'user_1',
    type: TransactionType.CREDIT,
    amount: 1500,
    description: 'Monthly Salary',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    counterparty: { name: 'Work Inc.', accountNumber: 'WORKINC001' },
  },
  {
    id: 'txn_2',
    userId: 'user_1',
    type: TransactionType.DEBIT,
    amount: 75.50,
    description: 'Grocery Shopping',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    counterparty: { name: 'SuperMart', accountNumber: 'SPRMART01' },
  },
  {
    id: 'txn_3',
    userId: 'user_1',
    type: TransactionType.DEBIT,
    amount: 200,
    description: 'Sent to Bob',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    counterparty: { name: 'Bob Smith', accountNumber: '0987654321' },
  },
  {
    id: 'txn_4',
    userId: 'user_2',
    type: TransactionType.CREDIT,
    amount: 200,
    description: 'Received from Alice',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    counterparty: { name: 'Alice Johnson', accountNumber: '1234567890' },
  },
];

export const LOANS: Loan[] = [
    {
        id: 'loan_1',
        userId: 'user_1',
        type: LoanTransactionType.DISBURSEMENT,
        amount: 500,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'loan_2',
        userId: 'user_1',
        type: LoanTransactionType.REPAYMENT,
        amount: 250,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const BILLERS: Biller[] = [
    { id: 'biller_1', name: 'City Power & Light' },
    { id: 'biller_2', name: 'AquaSprings Water' },
    { id: 'biller_3', name: 'ConnectFast ISP' },
    { id: 'biller_4', name: 'Urban Gas Co.' },
];

export const CRYPTO_PRICES = {
    [CryptoAsset.BTC]: 65000.00,
    [CryptoAsset.ETH]: 3500.00,
    [CryptoAsset.USDT]: 1.00,
};

export const CRYPTO_TRANSACTIONS: CryptoTransaction[] = [
    {
        id: 'ctx_1',
        userId: 'user_1',
        asset: CryptoAsset.BTC,
        type: CryptoTransactionType.BUY,
        cryptoAmount: 0.02,
        usdValue: 1280.40,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ctx_2',
        userId: 'user_1',
        asset: CryptoAsset.ETH,
        type: CryptoTransactionType.BUY,
        cryptoAmount: 2,
        usdValue: 6850.12,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ctx_3',
        userId: 'user_1',
        asset: CryptoAsset.ETH,
        type: CryptoTransactionType.SEND,
        cryptoAmount: 0.5,
        usdValue: 1750,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        counterparty: '0x1A2b3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9g0',
    },
    {
        id: 'ctx_4',
        userId: 'user_1',
        asset: CryptoAsset.USDT,
        type: CryptoTransactionType.RECEIVE,
        cryptoAmount: 500,
        usdValue: 500,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        counterparty: '0x9G8f7E6d5C4b3A2f1E0d9C8b7A6f5E4d3C2b1A0',
    }
];
