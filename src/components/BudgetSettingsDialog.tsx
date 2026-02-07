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
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { BudgetSettings } from '@/types/finance';
import { toast } from 'sonner';

interface BudgetSettingsDialogProps {
  settings: BudgetSettings;
  onUpdate: (settings: Partial<BudgetSettings>) => void;
}

export function BudgetSettingsDialog({ settings, onUpdate }: BudgetSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(settings.dailyCashLimit.toLocaleString('id-ID'));
  const [enableNotif, setEnableNotif] = useState(settings.enableNotifications);

  // Update state when dialog opens or settings change
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setDailyLimit(settings.dailyCashLimit.toLocaleString('id-ID'));
      setEnableNotif(settings.enableNotifications);
    }
  };

  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setDailyLimit(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const limit = parseFloat(dailyLimit.replace(/\./g, ''));
    if (isNaN(limit) || limit <= 0) {
      toast.error('Limit budget harus valid');
      return;
    }

    onUpdate({
      dailyCashLimit: limit,
      enableNotifications: enableNotif,
    });
    
    toast.success('Pengaturan budget berhasil disimpan!');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pengaturan Budget</DialogTitle>
          <DialogDescription>
            Atur limit pengeluaran harian untuk cash
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="daily-limit">Limit Pengeluaran Cash Harian (Rp)</Label>
            <Input
              id="daily-limit"
              type="text"
              inputMode="numeric"
              placeholder="30.000"
              value={dailyLimit}
              onChange={handleLimitChange}
            />
            <p className="text-xs text-muted-foreground">
              Kamu akan mendapat peringatan jika pengeluaran cash melebihi limit ini
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notif">Aktifkan Notifikasi</Label>
              <p className="text-xs text-muted-foreground">
                Tampilkan peringatan saat mendekati atau melebihi limit
              </p>
            </div>
            <Switch
              id="enable-notif"
              checked={enableNotif}
              onCheckedChange={setEnableNotif}
            />
          </div>

          <Button type="submit" className="w-full">
            Simpan Pengaturan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
