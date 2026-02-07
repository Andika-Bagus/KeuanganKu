import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import { toast } from 'sonner';

interface AddSavingsGoalDialogProps {
  onAdd: (name: string, targetAmount: number, deadline?: Date) => void;
}

export function AddSavingsGoalDialog({ onAdd }: AddSavingsGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setTargetAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Nama target harus diisi');
      return;
    }
    
    const amount = parseFloat(targetAmount.replace(/\./g, ''));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Jumlah target harus valid');
      return;
    }

    const deadlineDate = deadline ? new Date(deadline) : undefined;
    
    onAdd(name.trim(), amount, deadlineDate);
    toast.success('Target tabungan berhasil ditambahkan!');
    
    setName('');
    setTargetAmount('');
    setDeadline('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Tambah Target Tabungan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Target Tabungan Baru</DialogTitle>
          <DialogDescription>
            Buat target tabungan untuk tujuan finansialmu
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nama Target</Label>
            <Input
              id="goal-name"
              placeholder="Contoh: Beli Motor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-amount">Jumlah Target (Rp)</Label>
            <Input
              id="target-amount"
              type="text"
              inputMode="numeric"
              placeholder="15.000.000"
              value={targetAmount}
              onChange={handleAmountChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Tambah Target
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
