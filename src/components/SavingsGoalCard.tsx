import { SavingsGoal } from '@/types/finance';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  totalSavings: number;
  onDelete: (id: string) => void;
}

export function SavingsGoalCard({ goal, totalSavings, onDelete }: SavingsGoalCardProps) {
  const progress = (totalSavings / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - totalSavings;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{goal.name}</h3>
            {goal.deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>Target: {formatDate(goal.deadline)}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{Math.min(progress, 100).toFixed(0)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tabungan saat ini</span>
          <span className="font-semibold text-foreground">{formatCurrency(totalSavings)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Target</span>
          <span className="font-semibold text-primary">{formatCurrency(goal.targetAmount)}</span>
        </div>
        {remaining > 0 ? (
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kurang</span>
              <span className="font-bold text-destructive">{formatCurrency(remaining)}</span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm font-semibold text-green-600 text-center">
              🎉 Target tercapai!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
