import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw } from 'lucide-react';

interface ResetDataDialogProps {
  onReset: () => void;
}

export function ResetDataDialog({ onReset }: ResetDataDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="p-2 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Semua Data?</AlertDialogTitle>
          <AlertDialogDescription>
            Ini akan menghapus semua saldo dan riwayat transaksi. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onReset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
