import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, AccountType, TransactionType, TransactionCategory, SavingsGoal, BudgetSettings } from '@/types/finance';
import { toast } from 'sonner';

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

export function useSupabaseFinance() {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (!user) {
      setData(defaultData);
      setLoading(false);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      console.log('Loading data for user:', user.id);
      
      // Load user data (balances and settings)
      const { data: userData, error: userError } = await supabase
        .from('users_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user data:', userError);
      } else {
        console.log('User data loaded:', userData);
      }

      // Load transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transError) {
        console.error('Error loading transactions:', transError);
      } else {
        console.log('Transactions loaded:', transactionsData?.length || 0);
      }

      // Load savings goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error loading savings goals:', goalsError);
      } else {
        console.log('Savings goals loaded:', goalsData?.length || 0);
      }

      setData({
        bankBalance: userData?.bank_balance || 0,
        cashBalance: userData?.cash_balance || 0,
        savingsBalance: userData?.savings_balance || 0,
        transactions: (transactionsData || []).map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          account: t.account,
          targetAccount: t.target_account,
          date: new Date(t.date),
          category: t.category,
        })),
        savingsGoals: (goalsData || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          deadline: g.deadline ? new Date(g.deadline) : undefined,
          createdAt: new Date(g.created_at),
        })),
        budgetSettings: userData?.budget_settings || defaultData.budgetSettings,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (newBankBalance: number, newCashBalance: number, newSavingsBalance: number) => {
    if (!user) return;

    try {
      console.log('Updating balances:', { 
        bank: newBankBalance, 
        cash: newCashBalance, 
        savings: newSavingsBalance 
      });
      
      // First, check if user data exists
      const { data: existingData } = await supabase
        .from('users_data')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('users_data')
          .update({
            bank_balance: newBankBalance,
            cash_balance: newCashBalance,
            savings_balance: newSavingsBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        console.log('Balances updated (UPDATE)');
      } else {
        // Insert new record
        const { error } = await supabase
          .from('users_data')
          .insert({
            user_id: user.id,
            bank_balance: newBankBalance,
            cash_balance: newCashBalance,
            savings_balance: newSavingsBalance,
            budget_settings: data.budgetSettings,
          });
        
        if (error) throw error;
        console.log('Balances updated (INSERT)');
      }
    } catch (error) {
      console.error('Error updating balances:', error);
      toast.error('Gagal menyimpan saldo');
      throw error;
    }
  };

  const addTransaction = async (
    type: TransactionType,
    amount: number,
    description: string,
    account: AccountType,
    targetAccount?: AccountType,
    category?: TransactionCategory
  ) => {
    if (!user) return;

    const transaction: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      description,
      account,
      targetAccount,
      date: new Date(),
      category,
    };

    let newBankBalance = data.bankBalance;
    let newCashBalance = data.cashBalance;
    let newSavingsBalance = data.savingsBalance;

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
      if (account === 'bank') {
        newBankBalance -= amount;
        newCashBalance += amount;
      } else {
        newCashBalance -= amount;
        newBankBalance += amount;
      }
    } else if (type === 'save') {
      if (account === 'bank') {
        newBankBalance -= amount;
      } else if (account === 'cash') {
        newCashBalance -= amount;
      }
      newSavingsBalance += amount;
    }

    try {
      console.log('Adding transaction:', { type, amount, description, account });
      
      // Save transaction to Supabase
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          account: transaction.account,
          target_account: transaction.targetAccount,
          date: transaction.date.toISOString(),
          category: transaction.category,
        });

      if (error) {
        console.error('Error inserting transaction:', error);
        throw error;
      }

      console.log('Transaction saved, updating balances...');
      
      // Update balances
      await updateUserData(newBankBalance, newCashBalance, newSavingsBalance);

      console.log('Balances updated successfully');

      setData((prev) => ({
        ...prev,
        bankBalance: newBankBalance,
        cashBalance: newCashBalance,
        savingsBalance: newSavingsBalance,
        transactions: [transaction, ...prev.transactions],
      }));
      
      toast.success('Transaksi berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Gagal menambah transaksi');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const transaction = data.transactions.find((t) => t.id === id);
    if (!transaction) return;

    let newBankBalance = data.bankBalance;
    let newCashBalance = data.cashBalance;
    let newSavingsBalance = data.savingsBalance;

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
      if (transaction.account === 'bank') {
        newBankBalance += transaction.amount;
        newCashBalance -= transaction.amount;
      } else {
        newCashBalance += transaction.amount;
        newBankBalance -= transaction.amount;
      }
    } else if (transaction.type === 'save') {
      if (transaction.account === 'bank') {
        newBankBalance += transaction.amount;
      } else if (transaction.account === 'cash') {
        newCashBalance += transaction.amount;
      }
      newSavingsBalance -= transaction.amount;
    }

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update balances
      await updateUserData(newBankBalance, newCashBalance, newSavingsBalance);

      setData((prev) => ({
        ...prev,
        bankBalance: newBankBalance,
        cashBalance: newCashBalance,
        savingsBalance: newSavingsBalance,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Gagal menghapus transaksi');
    }
  };

  const resetData = async () => {
    if (!user) return;

    try {
      // Delete all transactions
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      // Delete all savings goals
      await supabase
        .from('savings_goals')
        .delete()
        .eq('user_id', user.id);

      // Reset user data
      await updateUserData(0, 0, 0);

      setData(defaultData);
      toast.success('Data berhasil direset');
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Gagal reset data');
    }
  };

  const addSavingsGoal = async (name: string, targetAmount: number, deadline?: Date) => {
    if (!user) return;

    const goal: SavingsGoal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      targetAmount,
      currentAmount: 0,
      deadline,
      createdAt: new Date(),
    };

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert({
          id: goal.id,
          user_id: user.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline?.toISOString(),
          created_at: goal.createdAt.toISOString(),
        });

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, goal],
      }));
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast.error('Gagal menambah target tabungan');
    }
  };

  const updateSavingsGoal = async (id: string, currentAmount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: currentAmount })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map(goal =>
          goal.id === id ? { ...goal, currentAmount } : goal
        ),
      }));
    } catch (error) {
      console.error('Error updating savings goal:', error);
      toast.error('Gagal update target tabungan');
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.filter(goal => goal.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      toast.error('Gagal menghapus target tabungan');
    }
  };

  const updateBudgetSettings = async (settings: Partial<BudgetSettings>) => {
    if (!user) return;

    const newSettings = { ...data.budgetSettings, ...settings };

    try {
      // Update budget settings in Supabase
      const { error } = await supabase
        .from('users_data')
        .update({
          budget_settings: newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        budgetSettings: newSettings,
      }));
    } catch (error) {
      console.error('Error updating budget settings:', error);
      toast.error('Gagal update pengaturan budget');
    }
  };

  return {
    bankBalance: data.bankBalance,
    cashBalance: data.cashBalance,
    savingsBalance: data.savingsBalance,
    transactions: data.transactions,
    savingsGoals: data.savingsGoals,
    budgetSettings: data.budgetSettings,
    loading,
    addTransaction,
    deleteTransaction,
    resetData,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateBudgetSettings,
  };
}
