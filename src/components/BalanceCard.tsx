import { Wallet, Building2 } from 'lucide-react';
import { AccountType } from '@/types/finance';

interface BalanceCardProps {
  type: AccountType;
  balance: number;
  name: string;
}

export function BalanceCard({ type, balance, name }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`balance-card ${type === 'bank' ? 'balance-card-bank' : 'balance-card-cash'} animate-fade-in`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center">
            {type === 'bank' ? (
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          <span className="text-white/90 font-medium text-sm sm:text-base">{name}</span>
        </div>
        
        <div className="space-y-1">
          <p className="text-white/70 text-xs sm:text-sm">Saldo</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight break-all">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
