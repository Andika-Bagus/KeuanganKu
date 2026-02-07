import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { AccountType, TransactionType, TransactionCategory } from '@/types/finance';

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'makan', label: '🍽️ Makan' },
  { value: 'laundry', label: '🧺 Laundry' },
  { value: 'kebutuhan-sehari-hari', label: '🛒 Kebutuhan Sehari-hari' },
  { value: 'rumah', label: '🏠 Rumah' },
  { value: 'arisan', label: '💰 Arisan' },
  { value: 'orang-tua', label: '👨‍👩‍👧 Orang Tua' },
  { value: 'kebutuhan-mendadak', label: '⚡ Kebutuhan Mendadak' },
  { value: 'jajan', label: '🍭 Jajan' },
  { value: 'self-reward', label: '🎁 Self Reward' },
  { value: 'lainnya', label: '📝 Lainnya' },
];

interface AddTransactionDialogProps {
  onAdd: (
    type: TransactionType,
    amount: number,
    description: string,
    account: AccountType,
    targetAccount?: AccountType,
    category?: TransactionCategory
  ) => void;
  bankBalance: number;
  cashBalance: number;
  savingsBalance: number;
  dailyBudgetLimit: number;
  todayExpenses: number;
}

export function AddTransactionDialog({ onAdd, bankBalance, cashBalance, savingsBalance, dailyBudgetLimit, todayExpenses }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState<AccountType>('cash');
  const [category, setCategory] = useState<TransactionCategory>('lainnya');
  const [showBudgetConfirm, setShowBudgetConfirm] = useState(false);

  // Auto-set account to cash when expense is selected
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setAccount('cash');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/\./g, ''));
    if (numAmount <= 0 || !description.trim()) return;

    // Validate balance for expense and transfer (HARD LIMIT - cannot submit)
    if (type === 'expense' || type === 'transfer') {
      const maxAmount = account === 'bank' ? bankBalance : cashBalance;
      if (numAmount > maxAmount) {
        return; // Prevent submission if amount exceeds balance
      }
    }

    // Check if exceeds budget and needs confirmation
    if (type === 'expense' && account === 'cash') {
      const totalToday = todayExpenses + numAmount;
      if (totalToday > dailyBudgetLimit && !showBudgetConfirm) {
        setShowBudgetConfirm(true);
        return; // Show confirmation dialog first
      }
    }

    // Proceed with transaction
    submitTransaction();
  };

  const submitTransaction = () => {
    const numAmount = parseFloat(amount.replace(/\./g, ''));
    
    // For transfer, the target is the opposite account
    const targetAccount = type === 'transfer' 
      ? (account === 'bank' ? 'cash' : 'bank') 
      : undefined;

    onAdd(type, numAmount, description.trim(), account, targetAccount, type === 'expense' ? category : undefined);
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('lainnya');
    setShowBudgetConfirm(false);
    setOpen(false);
  };

  const cancelBudgetConfirm = () => {
    setShowBudgetConfirm(false);
  };

  const getMaxAmount = () => {
    if (type === 'income') return undefined;
    if (type === 'expense' || type === 'transfer' || type === 'save') {
      if (account === 'bank') return bankBalance;
      if (account === 'cash') return cashBalance;
      if (account === 'savings') return savingsBalance;
    }
    return undefined;
  };

  const isValid = () => {
    const numAmount = parseFloat(amount.replace(/\./g, ''));
    if (!numAmount || numAmount <= 0 || !description.trim()) return false;
    
    // Only check balance, not budget (budget is just a warning)
    if (type !== 'income') {
      const max = getMaxAmount();
      if (max !== undefined && numAmount > max) return false;
    }
    
    return true;
  };

  // Check if exceeds daily budget (SOFT WARNING - can still submit)
  const checkBudgetWarning = () => {
    if (type !== 'expense' || account !== 'cash' || !amount) return null;
    
    const numAmount = parseFloat(amount.replace(/\./g, ''));
    if (isNaN(numAmount)) return null;
    
    const totalToday = todayExpenses + numAmount;
    
    if (totalToday > dailyBudgetLimit) {
      return {
        type: 'error' as const,
        message: `⚠️ Akan melebihi budget harian! Total: Rp ${totalToday.toLocaleString('id-ID')} (Limit: Rp ${dailyBudgetLimit.toLocaleString('id-ID')}). Klik submit untuk konfirmasi.`
      };
    } else if (totalToday >= dailyBudgetLimit * 0.8) {
      return {
        type: 'warning' as const,
        message: `⚠️ Mendekati limit budget! Total hari ini: Rp ${totalToday.toLocaleString('id-ID')} dari Rp ${dailyBudgetLimit.toLocaleString('id-ID')}`
      };
    }
    
    return null;
  };

  const budgetWarning = checkBudgetWarning();

  // Format number with thousand separators
  const formatNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Add thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    setAmount(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg fixed bottom-6 right-6 z-50">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showBudgetConfirm ? '⚠️ Peringatan Budget' : 'Tambah Transaksi'}
          </DialogTitle>
        </DialogHeader>
        
        {showBudgetConfirm ? (
          // Budget Confirmation View
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                Budget Harian Terlampaui!
              </p>
              <p className="text-sm text-muted-foreground">
                Pengeluaran cash hari ini akan menjadi:{' '}
                <span className="font-semibold text-foreground">
                  Rp {(todayExpenses + parseFloat(amount.replace(/\./g, '') || '0')).toLocaleString('id-ID')}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Limit budget harian:{' '}
                <span className="font-semibold text-foreground">
                  Rp {dailyBudgetLimit.toLocaleString('id-ID')}
                </span>
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Apakah kamu yakin ingin melanjutkan transaksi ini? Ini mungkin untuk kebutuhan mendesak.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={cancelBudgetConfirm}
              >
                Batal
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={submitTransaction}
              >
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        ) : (
          // Normal Transaction Form
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  type === 'income' 
                    ? 'border-success bg-success/10 text-success' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Masuk</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  type === 'expense' 
                    ? 'border-destructive bg-destructive/10 text-destructive' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-medium">Keluar</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('transfer')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  type === 'transfer' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-xs font-medium">Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('save')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  type === 'save' 
                    ? 'border-yellow-600 bg-yellow-600/10 text-yellow-700 dark:text-yellow-500' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="text-lg">💰</span>
                <span className="text-xs font-medium">Nabung</span>
              </button>
            </div>
          </div>

          {/* Account Selection */}
          {type !== 'save' && (
          <div className="space-y-2">
            <Label>
              {type === 'transfer' ? 'Transfer Dari' : type === 'income' ? 'Masuk Ke' : 'Keluar Dari'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAccount('bank')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  account === 'bank' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="font-medium text-sm">Rekening</span>
                <p className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(bankBalance)}
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setAccount('cash')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  account === 'cash' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="font-medium text-sm">Cash</span>
                <p className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(cashBalance)}
                </p>
              </button>

              {type === 'expense' && (
                <button
                  type="button"
                  onClick={() => setAccount('savings')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    account === 'savings' 
                      ? 'border-yellow-600 bg-yellow-600/5' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <span className="font-medium text-sm">Tabungan</span>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(savingsBalance)}
                  </p>
                </button>
              )}
            </div>
            
            {type === 'transfer' && (
              <p className="text-sm text-muted-foreground">
                → Ke {account === 'bank' ? 'Cash' : 'Rekening'}
              </p>
            )}
          </div>
          )}

          {/* For Save type, show source selection */}
          {type === 'save' && (
          <div className="space-y-2">
            <Label>Nabung Dari</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccount('bank')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  account === 'bank' 
                    ? 'border-yellow-600 bg-yellow-600/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="font-medium">Rekening</span>
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(bankBalance)}
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setAccount('cash')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  account === 'cash' 
                    ? 'border-yellow-600 bg-yellow-600/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="font-medium">Cash</span>
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(cashBalance)}
                </p>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              → Ke Tabungan
            </p>
          </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className="pl-12 text-lg h-12"
              />
            </div>
            
            {/* Balance validation (HARD LIMIT) */}
            {type !== 'income' && getMaxAmount() !== undefined && (
              <>
                <p className="text-xs text-muted-foreground">
                  Saldo tersedia: {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(getMaxAmount()!)}
                </p>
                {amount && parseFloat(amount.replace(/\./g, '')) > getMaxAmount()! && (
                  <p className="text-xs text-destructive font-medium flex items-center gap-1">
                    <span>❌</span>
                    <span>Saldo tidak cukup! Maksimal {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(getMaxAmount()!)}</span>
                  </p>
                )}
              </>
            )}
            
            {/* Budget warning (SOFT WARNING) */}
            {budgetWarning && (
              <div className={`text-xs font-medium flex items-center gap-1 p-2 rounded-lg ${
                budgetWarning.type === 'error' 
                  ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                  : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-500/20'
              }`}>
                <span>{budgetWarning.message}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Input
              id="description"
              placeholder={
                type === 'income' 
                  ? 'Contoh: Gaji bulanan' 
                  : type === 'expense'
                  ? 'Contoh: Beli makan siang'
                  : type === 'save'
                  ? 'Contoh: Nabung untuk motor'
                  : 'Contoh: Tarik tunai ATM'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12"
              maxLength={100}
            />
          </div>

          {/* Category - only for expenses */}
          {type === 'expense' && (
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base"
            disabled={!isValid()}
          >
            {type === 'income' ? 'Tambah Pemasukan' : type === 'expense' ? 'Catat Pengeluaran' : type === 'save' ? 'Nabung' : 'Transfer'}
          </Button>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
