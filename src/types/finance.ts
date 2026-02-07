export type AccountType = 'bank' | 'cash' | 'savings';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'save';

export type TransactionCategory = 
  | 'makan'
  | 'laundry'
  | 'kebutuhan-sehari-hari'
  | 'rumah'
  | 'arisan'
  | 'orang-tua'
  | 'kebutuhan-mendadak'
  | 'jajan'
  | 'self-reward'
  | 'lainnya';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  account: AccountType;
  targetAccount?: AccountType; // For transfers
  date: Date;
  category?: TransactionCategory;
}

export interface Account {
  type: AccountType;
  balance: number;
  name: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  createdAt: Date;
}

export interface BudgetSettings {
  dailyCashLimit: number;
  enableNotifications: boolean;
}
