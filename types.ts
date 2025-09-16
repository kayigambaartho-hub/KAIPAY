export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  accountNumber: string;
  balance: number;
  isBiometricEnabled?: boolean;
  savingsBalance: number;
  loanLimit: number;
  outstandingLoan: number;
  loanDueDate?: string;
  // New crypto fields
  isCryptoKycVerified: boolean;
  hasCryptoWallet: boolean;
  cryptoBalances: {
      [CryptoAsset.BTC]: number;
      [CryptoAsset.ETH]: number;
      [CryptoAsset.USDT]: number;
  };
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  counterparty: {
    name: string;
    accountNumber: string;
  };
}

export interface Biller {
    id: string;
    name: string;
}

export enum View {
  LOGIN,
  REGISTER,
  TFA,
  BIOMETRIC,
  DASHBOARD,
}

export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error'
}

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

export enum LoanTransactionType {
    DISBURSEMENT = 'disbursement',
    REPAYMENT = 'repayment',
}

export interface Loan {
    id: string;
    userId: string;
    type: LoanTransactionType;
    amount: number;
    date: string;
}

// --- New Crypto Types ---

export enum CryptoAsset {
    BTC = 'BTC',
    ETH = 'ETH',
    USDT = 'USDT',
}

export enum CryptoTransactionType {
    BUY = 'buy',
    SELL = 'sell',
    SEND = 'send',
    RECEIVE = 'receive',
}

export interface CryptoTransaction {
    id: string;
    userId: string;
    asset: CryptoAsset;
    type: CryptoTransactionType;
    cryptoAmount: number;
    usdValue: number;
    date: string;
    counterparty?: string; // e.g., external address for send/receive
}
