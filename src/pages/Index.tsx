import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { ResetDataDialog } from '@/components/ResetDataDialog';
import { SavingsGoalCard } from '@/components/SavingsGoalCard';
import { AddSavingsGoalDialog } from '@/components/AddSavingsGoalDialog';
import { BudgetSettingsDialog } from '@/components/BudgetSettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useFinance } from '@/hooks/useFinance';

const Index = () => {
  const { 
    bankBalance, 
    cashBalance, 
    savingsBalance,
    transactions, 
    savingsGoals,
    budgetSettings,
    addTransaction, 
    deleteTransaction, 
    resetData,
    addSavingsGoal,
    deleteSavingsGoal,
    updateBudgetSettings,
  } = useFinance();

  const totalBalance = bankBalance + cashBalance;

  // Calculate today's cash expenses
  const todayCashExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      const today = new Date();
      tDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return t.type === 'expense' && 
             t.account === 'cash' && 
             tDate.getTime() === today.getTime();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header Card */}
        <header className="mb-6 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-foreground">Catatan Keuangan</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <BudgetSettingsDialog settings={budgetSettings} onUpdate={updateBudgetSettings} />
              <Link 
                to="/statistics" 
                className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
              </Link>
              <ResetDataDialog onReset={resetData} />
            </div>
          </div>
          <p className="text-muted-foreground">Kelola uangmu dengan bijak</p>
          
          {/* Total Balance inside header */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Rekening + Cash</p>
            </div>
            <div className="pt-3 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Total Tabungan</p>
              <p className="text-3xl font-bold text-yellow-600">{formatCurrency(savingsBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Khusus untuk target</p>
            </div>
          </div>
        </header>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <BalanceCard type="bank" balance={bankBalance} name="Rekening" />
          <BalanceCard type="cash" balance={cashBalance} name="Cash" />
        </div>

        {/* Savings Goals */}
        {savingsGoals.length > 0 && (
          <section className="mb-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground px-1">Target Tabungan</h2>
            <div className="space-y-3">
              {savingsGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  totalSavings={savingsBalance}
                  onDelete={deleteSavingsGoal}
                />
              ))}
            </div>
          </section>
        )}

        {/* Add Savings Goal Button */}
        <div className="mb-6">
          <AddSavingsGoalDialog onAdd={addSavingsGoal} />
        </div>

        {/* Transactions Card */}
        <section className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Riwayat Transaksi</h2>
            <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
              {transactions.length} transaksi
            </span>
          </div>
          
          <div className="p-4">
            <TransactionList 
              transactions={transactions} 
              onDelete={deleteTransaction}
            />
          </div>
        </section>

        {/* FAB */}
        <AddTransactionDialog 
          onAdd={addTransaction}
          bankBalance={bankBalance}
          cashBalance={cashBalance}
          savingsBalance={savingsBalance}
          dailyBudgetLimit={budgetSettings.dailyCashLimit}
          todayExpenses={todayCashExpenses}
        />
      </div>
    </div>
  );
};

export default Index;
