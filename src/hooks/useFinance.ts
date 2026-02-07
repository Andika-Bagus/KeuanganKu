import { useState, useEffect } from 'react';
import { Transaction, AccountType, TransactionType, TransactionCategory, SavingsGoal, BudgetSettings } from '@/types/finance';

const STORAGE_KEY = 'finance-data';

interface FinanceData {
  bankBalance: number;
  cashBalance: number;
  savingsBalance: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgetSettings: BudgetSettings;
}

const defaultData: FinanceData = {
  bankBalance: 0,
  cashBalance: 0,
  savingsBalance: 0,
  transactions: [],
  savingsGoals: [],
  budgetSettings: {
    dailyCashLimit: 30000,
    enableNotifications: true,
  },
};

export function useFinance() {
  const [data, setData] = useState<FinanceData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        bankBalance: parsed.bankBalance || 0,
        cashBalance: parsed.cashBalance || 0,
        savingsBalance: parsed.savingsBalance || 0,
        transactions: (parsed.transactions || []).map((t: Transaction) => ({
          ...t,
          date: new Date(t.date),
        })),
        savingsGoals: (parsed.savingsGoals || []).map((g: SavingsGoal) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          deadline: g.deadline ? new Date(g.deadline) : undefined,
        })),
        budgetSettings: parsed.budgetSettings || defaultData.budgetSettings,
      };
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTransaction = (
    type: TransactionType,
    amount: number,
    description: string,
    account: AccountType,
    targetAccount?: AccountType,
    category?: TransactionCategory
  ) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      account,
      targetAccount,
      date: new Date(),
      category,
    };

    setData((prev) => {
      let newBankBalance = prev.bankBalance;
      let newCashBalance = prev.cashBalance;
      let newSavingsBalance = prev.savingsBalance;

      if (type === 'income') {
        if (account === 'bank') {
          newBankBalance += amount;
        } else if (account === 'cash') {
          newCashBalance += amount;
        }
      } else if (type === 'expense') {
        if (account === 'bank') {
          newBankBalance -= amount;
        } else if (account === 'cash') {
          newCashBalance -= amount;
        } else if (account === 'savings') {
          newSavingsBalance -= amount;
        }
      } else if (type === 'transfer' && targetAccount) {
        // Transfer from account to targetAccount
        if (account === 'bank') {
          newBankBalance -= amount;
          newCashBalance += amount;
        } else {
          newCashBalance -= amount;
          newBankBalance += amount;
        }
      } else if (type === 'save') {
        // Save to savings from bank or cash
        if (account === 'bank') {
          newBankBalance -= amount;
        } else if (account === 'cash') {
          newCashBalance -= amount;
        }
        newSavingsBalance += amount;
      }

      return {
        ...prev,
        bankBalance: newBankBalance,
        cashBalance: newCashBalance,
        savingsBalance: newSavingsBalance,
        transactions: [transaction, ...prev.transactions],
      };
    });
  };

  const deleteTransaction = (id: string) => {
    setData((prev) => {
      const transaction = prev.transactions.find((t) => t.id === id);
      if (!transaction) return prev;

      let newBankBalance = prev.bankBalance;
      let newCashBalance = prev.cashBalance;
      let newSavingsBalance = prev.savingsBalance;

      // Reverse the transaction
      if (transaction.type === 'income') {
        if (transaction.account === 'bank') {
          newBankBalance -= transaction.amount;
        } else if (transaction.account === 'cash') {
          newCashBalance -= transaction.amount;
        }
      } else if (transaction.type === 'expense') {
        if (transaction.account === 'bank') {
          newBankBalance += transaction.amount;
        } else if (transaction.account === 'cash') {
          newCashBalance += transaction.amount;
        } else if (transaction.account === 'savings') {
          newSavingsBalance += transaction.amount;
        }
      } else if (transaction.type === 'transfer' && transaction.targetAccount) {
        // Reverse transfer
        if (transaction.account === 'bank') {
          newBankBalance += transaction.amount;
          newCashBalance -= transaction.amount;
        } else {
          newCashBalance += transaction.amount;
          newBankBalance -= transaction.amount;
        }
      } else if (transaction.type === 'save') {
        // Reverse save
        if (transaction.account === 'bank') {
          newBankBalance += transaction.amount;
        } else if (transaction.account === 'cash') {
          newCashBalance += transaction.amount;
        }
        newSavingsBalance -= transaction.amount;
      }

      return {
        ...prev,
        bankBalance: newBankBalance,
        cashBalance: newCashBalance,
        savingsBalance: newSavingsBalance,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  };

  const resetData = () => {
    setData(defaultData);
  };

  const addSavingsGoal = (name: string, targetAmount: number, deadline?: Date) => {
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name,
      targetAmount,
      currentAmount: 0,
      deadline,
      createdAt: new Date(),
    };
    
    setData((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, goal],
    }));
  };

  const updateSavingsGoal = (id: string, currentAmount: number) => {
    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(goal =>
        goal.id === id ? { ...goal, currentAmount } : goal
      ),
    }));
  };

  const deleteSavingsGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(goal => goal.id !== id),
    }));
  };

  const updateBudgetSettings = (settings: Partial<BudgetSettings>) => {
    setData((prev) => ({
      ...prev,
      budgetSettings: { ...prev.budgetSettings, ...settings },
    }));
  };

  return {
    bankBalance: data.bankBalance,
    cashBalance: data.cashBalance,
    savingsBalance: data.savingsBalance,
    transactions: data.transactions,
    savingsGoals: data.savingsGoals,
    budgetSettings: data.budgetSettings,
    addTransaction,
    deleteTransaction,
    resetData,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateBudgetSettings,
  };
}
