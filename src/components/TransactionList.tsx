import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'expense':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'bg-success/10 text-success';
      case 'expense':
        return 'bg-destructive/10 text-destructive';
      case 'transfer':
        return 'bg-primary/10 text-primary';
    }
  };

  const getAccountLabel = (account: string) => {
    return account === 'bank' ? 'Rekening' : 'Cash';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Belum ada transaksi</p>
        <p className="text-sm mt-1">Tambah transaksi pertamamu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-border transition-colors animate-slide-up group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconBg(transaction.type)}`}>
            {getIcon(transaction.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {transaction.type === 'transfer' 
                ? `${getAccountLabel(transaction.account)} → ${getAccountLabel(transaction.targetAccount!)}`
                : getAccountLabel(transaction.account)
              }
              {' • '}
              {format(transaction.date, 'd MMM, HH:mm', { locale: id })}
            </p>
          </div>
          
          <div className="text-right flex items-center gap-2">
            <span className={`font-semibold ${
              transaction.type === 'income' 
                ? 'transaction-income' 
                : transaction.type === 'expense'
                ? 'transaction-expense'
                : 'text-primary'
            }`}>
              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
              {formatCurrency(transaction.amount)}
            </span>
            
            <button
              onClick={() => onDelete(transaction.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
